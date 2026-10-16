import type {
  ChangePasswordInput,
  CreateUserInput,
  PaginatedResponse,
  ProfileDto,
  UpdateProfileInput,
  UpdateUserInput,
  UserDto,
} from '@mytutor/contracts';
import { AppError, conflict, invalid, notFound } from '../../shared/errors/app-error.js';
import { buildPagination, normalizePage } from '../../shared/http/pagination.js';
import type { PasswordHasher } from '../../shared/security/password-hasher.js';
import { cleanMultiline, cleanText } from '../../shared/text.js';
import type { AuditLogger } from '../audit/audit.types.js';
import { normalizeUsername } from '../auth/auth.service.js';
import type { AuthenticatedActor, SessionRepository } from '../auth/auth.types.js';
import type { AuthorizationPolicy } from '../auth/authorization.policy.js';
import { toProfileDto, toUserDto } from './user.mapper.js';
import type { ProfileFields, UserPatch, UserRepository } from './user.types.js';

export interface UserListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Facade over account workflows (legacy ManageUser / AddUser / EditUser / ManageProfile /
 * ChangePassword). Each method coordinates validation, hashing, persistence, session
 * revocation and auditing so routes stay thin.
 */
export class UserFacade {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
    private readonly policy: AuthorizationPolicy,
    private readonly audit: AuditLogger,
  ) {}

  // ----- Administration (admin only) -----

  async listUsers(query: UserListQuery, actor: AuthenticatedActor): Promise<PaginatedResponse<UserDto>> {
    this.policy.assert(actor, 'users:manage');
    const page = normalizePage(query.page, query.pageSize, 20);
    const search = query.search?.trim();
    const result = await this.users.list(search ? { search } : {}, page);
    return { data: result.items.map(toUserDto), pagination: buildPagination(page, result.totalItems) };
  }

  async getUser(id: number, actor: AuthenticatedActor): Promise<UserDto> {
    this.policy.assert(actor, 'users:manage');
    const user = await this.users.findById(id);
    if (!user) throw notFound('User');
    return toUserDto(user);
  }

  /** Legacy behaviour: administrators create operator accounts. */
  async createUser(input: CreateUserInput, actor: AuthenticatedActor): Promise<UserDto> {
    this.policy.assert(actor, 'users:manage');
    const username = normalizeUsername(input.username);
    if (await this.users.findByUsername(username)) {
      throw conflict('That username is already taken.', [{ field: 'username', message: 'Username already exists.' }]);
    }
    const created = await this.users.create({
      ...cleanProfile(input),
      username,
      passwordHash: await this.hasher.hash(input.password),
      role: 'OPERATOR',
      status: input.status ?? 'ACTIVE',
    });
    await this.audit.record({
      actorId: actor.userId,
      action: 'user.created',
      entityType: 'user',
      entityId: String(created.id),
      summary: `Created operator account "${created.username}"`,
    });
    return toUserDto(created);
  }

  async updateUser(id: number, input: UpdateUserInput, actor: AuthenticatedActor): Promise<UserDto> {
    this.policy.assert(actor, 'users:manage');
    const existing = await this.users.findById(id);
    if (!existing) throw notFound('User');
    if (id === actor.userId && input.status === 'INACTIVE') {
      throw invalid([{ field: 'status', message: 'You cannot deactivate your own account.' }]);
    }

    const previousStatus = existing.status;
    const patch: UserPatch = cleanProfilePatch(input);
    if (input.status !== undefined) patch.status = input.status;
    if (input.password !== undefined) patch.passwordHash = await this.hasher.hash(input.password);

    const updated = await this.users.update(id, patch);
    const credentialsChanged = input.password !== undefined;
    const deactivated = previousStatus === 'ACTIVE' && updated.status === 'INACTIVE';
    if (credentialsChanged || deactivated) {
      await this.sessions.deleteForUser(id, id === actor.userId ? actor.sessionId : undefined);
    }

    const changes = [
      deactivated ? 'deactivated' : previousStatus !== updated.status ? 'activated' : null,
      credentialsChanged ? 'password reset' : null,
    ].filter(Boolean);
    await this.audit.record({
      actorId: actor.userId,
      action: 'user.updated',
      entityType: 'user',
      entityId: String(id),
      summary: `Updated user "${updated.username}"${changes.length ? ` (${changes.join(', ')})` : ''}`,
    });
    return toUserDto(updated);
  }

  // ----- Self-service (any authenticated user) -----

  async getProfile(actor: AuthenticatedActor): Promise<ProfileDto> {
    this.policy.assert(actor, 'profile:manage');
    const user = await this.users.findById(actor.userId);
    if (!user) throw notFound('User');
    return toProfileDto(user);
  }

  async updateProfile(input: UpdateProfileInput, actor: AuthenticatedActor): Promise<ProfileDto> {
    this.policy.assert(actor, 'profile:manage');
    const updated = await this.users.update(actor.userId, cleanProfile(input));
    return toProfileDto(updated);
  }

  /** Implements the legacy Change Password screen, which had a form but no handler. */
  async changePassword(input: ChangePasswordInput, actor: AuthenticatedActor): Promise<void> {
    this.policy.assert(actor, 'profile:manage');
    const user = await this.users.findById(actor.userId);
    if (!user) throw notFound('User');
    if (!(await this.hasher.verify(user.passwordHash, input.currentPassword))) {
      throw new AppError('VALIDATION_ERROR', 422, 'The current password is incorrect.', [
        { field: 'currentPassword', message: 'Current password is incorrect.' },
      ]);
    }
    if (input.currentPassword === input.newPassword) {
      throw invalid([{ field: 'newPassword', message: 'Choose a password different from the current one.' }]);
    }
    await this.users.update(actor.userId, { passwordHash: await this.hasher.hash(input.newPassword) });
    // Sign out other devices; keep the session that performed the change.
    await this.sessions.deleteForUser(actor.userId, actor.sessionId);
    await this.audit.record({
      actorId: actor.userId,
      action: 'user.password_changed',
      entityType: 'user',
      entityId: String(actor.userId),
      summary: `"${actor.username}" changed their password`,
    });
  }
}

function cleanProfile(input: UpdateProfileInput): ProfileFields {
  return {
    name: cleanText(input.name),
    email: cleanEmail(input.email),
    dateOfBirth: input.dateOfBirth ?? null,
    gender: input.gender ?? null,
    address: cleanMultiline(input.address),
    mobile: cleanMultiline(input.mobile),
  };
}

function cleanProfilePatch(input: Partial<UpdateProfileInput>): UserPatch {
  const patch: UserPatch = {};
  if (input.name !== undefined) patch.name = cleanText(input.name);
  if (input.email !== undefined) patch.email = cleanEmail(input.email);
  if (input.dateOfBirth !== undefined) patch.dateOfBirth = input.dateOfBirth;
  if (input.gender !== undefined) patch.gender = input.gender;
  if (input.address !== undefined) patch.address = cleanMultiline(input.address);
  if (input.mobile !== undefined) patch.mobile = cleanMultiline(input.mobile);
  return patch;
}

function cleanEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase();
  return value ? value : null;
}
