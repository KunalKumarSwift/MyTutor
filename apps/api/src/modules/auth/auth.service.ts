import type { SessionDto } from '@mytutor/contracts';
import { AppError } from '../../shared/errors/app-error.js';
import type { PasswordHasher } from '../../shared/security/password-hasher.js';
import {
  deriveCsrfToken,
  generateSessionToken,
  hashSessionToken,
} from '../../shared/security/tokens.js';
import { toPrincipalDto } from '../users/user.mapper.js';
import type { UserRepository } from '../users/user.types.js';
import type { AuthenticatedActor, Clock, SessionRepository } from './auth.types.js';

export interface AuthSettings {
  sessionSecret: string;
  sessionTtlSeconds: number;
}

export interface LoginResult {
  sessionToken: string;
  expiresAt: Date;
  session: SessionDto;
}

/** How often (ms) lastSeenAt is refreshed, to avoid a write on every request. */
const TOUCH_INTERVAL_MS = 60_000;

const invalidCredentials = () =>
  new AppError('INVALID_CREDENTIALS', 401, 'Invalid username or password.');

export class AuthService {
  /** Lazily computed hash used to equalize timing when the username does not exist. */
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
    private readonly clock: Clock,
    private readonly settings: AuthSettings,
  ) {}

  async login(username: string, password: string): Promise<LoginResult> {
    const user = await this.users.findByUsername(normalizeUsername(username));
    if (!user) {
      await this.hasher.verify(await this.getDummyHash(), password);
      throw invalidCredentials();
    }
    if (!(await this.hasher.verify(user.passwordHash, password))) throw invalidCredentials();
    // Only reachable with the correct password, so this does not reveal account existence.
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_INACTIVE', 403, 'This account has been deactivated.');
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(this.clock.now().getTime() + this.settings.sessionTtlSeconds * 1000);
    await this.sessions.create({
      userId: user.id,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt,
    });
    return {
      sessionToken,
      expiresAt,
      session: { user: toPrincipalDto(user), csrfToken: this.csrfTokenFor(sessionToken) },
    };
  }

  /** Resolves a raw cookie token to an actor, or null if missing, expired, revoked or inactive. */
  async authenticate(sessionToken: string): Promise<AuthenticatedActor | null> {
    const session = await this.sessions.findByTokenHash(hashSessionToken(sessionToken));
    if (!session) return null;
    const now = this.clock.now();
    if (session.expiresAt <= now) {
      await this.sessions.delete(session.id);
      return null;
    }
    const user = await this.users.findById(session.userId);
    if (!user || user.status !== 'ACTIVE') {
      await this.sessions.delete(session.id);
      return null;
    }
    if (now.getTime() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
      await this.sessions.touch(session.id, now);
    }
    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      sessionId: session.id,
    };
  }

  async logout(actor: AuthenticatedActor): Promise<void> {
    await this.sessions.delete(actor.sessionId);
  }

  csrfTokenFor(sessionToken: string): string {
    return deriveCsrfToken(this.settings.sessionSecret, sessionToken);
  }

  async revokeAllSessions(userId: number, exceptSessionId?: string): Promise<void> {
    await this.sessions.deleteForUser(userId, exceptSessionId);
  }

  async purgeExpiredSessions(): Promise<number> {
    return this.sessions.deleteExpired(this.clock.now());
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash('timing-equalization-placeholder');
    return this.dummyHash;
  }
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
