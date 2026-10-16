import { beforeEach, describe, expect, it } from 'vitest';
import { RepositoryAuditLogger } from '../../src/modules/audit/audit.logger.js';
import { AuthorizationPolicy } from '../../src/modules/auth/authorization.policy.js';
import { UserFacade } from '../../src/modules/users/user.facade.js';
import {
  actor,
  FakeHasher,
  InMemoryAuditRepository,
  InMemorySessionRepository,
  InMemoryUserRepository,
  silentLogger,
} from '../support/fakes.js';

describe('UserFacade', () => {
  let users: InMemoryUserRepository;
  let sessions: InMemorySessionRepository;
  let facade: UserFacade;
  const admin = actor({ userId: 1, sessionId: 'admin-session' });
  const operator = actor({ userId: 2, username: 'op', role: 'OPERATOR', sessionId: 'op-session' });

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    sessions = new InMemorySessionRepository();
    users.seed({ username: 'admin', role: 'ADMIN', passwordHash: 'hashed:old-password' });
    users.seed({ username: 'op', passwordHash: 'hashed:old-password' });
    facade = new UserFacade(
      users,
      sessions,
      new FakeHasher(),
      new AuthorizationPolicy(),
      new RepositoryAuditLogger(new InMemoryAuditRepository(), silentLogger),
    );
  });

  const newUser = {
    username: 'NewOp',
    password: 'secret-123',
    name: ' New  Operator ',
    email: ' New@Example.org ',
  };

  it('denies user management to operators', async () => {
    await expect(facade.listUsers({}, operator)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(facade.createUser(newUser, operator)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('creates operators (legacy rule) with a hashed password and normalized fields', async () => {
    const created = await facade.createUser(newUser, admin);
    expect(created).toMatchObject({
      username: 'newop',
      role: 'OPERATOR',
      name: 'New Operator',
      email: 'new@example.org',
      status: 'ACTIVE',
    });
    expect(users.users.at(-1)!.passwordHash).toBe('hashed:secret-123');
    expect(created).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate usernames', async () => {
    await expect(facade.createUser({ ...newUser, username: 'OP' }, admin)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('prevents administrators from deactivating themselves', async () => {
    await expect(facade.updateUser(1, { status: 'INACTIVE' }, admin)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it('revokes sessions when a user is deactivated or their password is reset', async () => {
    await sessions.create({ userId: 2, tokenHash: 'a', expiresAt: new Date(Date.now() + 1e6) });
    await facade.updateUser(2, { status: 'INACTIVE' }, admin);
    expect(sessions.sessions).toHaveLength(0);

    await facade.updateUser(2, { status: 'ACTIVE' }, admin);
    await sessions.create({ userId: 2, tokenHash: 'b', expiresAt: new Date(Date.now() + 1e6) });
    await facade.updateUser(2, { password: 'brand-new-pw' }, admin);
    expect(sessions.sessions).toHaveLength(0);
    expect(users.users[1]!.passwordHash).toBe('hashed:brand-new-pw');
  });

  it('change password verifies the current password and keeps only the current session', async () => {
    await expect(
      facade.changePassword({ currentPassword: 'wrong', newPassword: 'another-pw' }, operator),
    ).rejects.toMatchObject({ details: [expect.objectContaining({ field: 'currentPassword' })] });

    const current = await sessions.create({
      userId: 2,
      tokenHash: 'cur',
      expiresAt: new Date(Date.now() + 1e6),
    });
    await sessions.create({ userId: 2, tokenHash: 'other', expiresAt: new Date(Date.now() + 1e6) });
    await facade.changePassword(
      { currentPassword: 'old-password', newPassword: 'another-pw' },
      { ...operator, sessionId: current.id },
    );
    expect(sessions.sessions.map((s) => s.id)).toEqual([current.id]);
    expect(users.users[1]!.passwordHash).toBe('hashed:another-pw');
  });

  it('rejects reusing the current password', async () => {
    await expect(
      facade.changePassword(
        { currentPassword: 'old-password', newPassword: 'old-password' },
        operator,
      ),
    ).rejects.toMatchObject({ details: [expect.objectContaining({ field: 'newPassword' })] });
  });

  it('updates only the caller’s own profile', async () => {
    const profile = await facade.updateProfile(
      { name: 'Op Erator', email: 'OP@x.org', mobile: '' },
      operator,
    );
    expect(profile).toMatchObject({ id: 2, name: 'Op Erator', email: 'op@x.org', mobile: null });
    expect(users.users[0]!.name).toBe('admin');
  });
});
