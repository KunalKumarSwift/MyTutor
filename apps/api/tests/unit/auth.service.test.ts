import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { hashSessionToken } from '../../src/shared/security/tokens.js';
import { FakeClock, FakeHasher, InMemorySessionRepository, InMemoryUserRepository } from '../support/fakes.js';

describe('AuthService', () => {
  let users: InMemoryUserRepository;
  let sessions: InMemorySessionRepository;
  let clock: FakeClock;
  let auth: AuthService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    sessions = new InMemorySessionRepository();
    clock = new FakeClock();
    auth = new AuthService(users, sessions, new FakeHasher(), clock, { sessionSecret: 's'.repeat(40), sessionTtlSeconds: 3600 });
    users.seed({ username: 'alice', passwordHash: 'hashed:correct-horse', role: 'ADMIN', name: 'Alice' });
  });

  it('creates a session, stores only the token hash, and returns the principal', async () => {
    const result = await auth.login('  Alice ', 'correct-horse');
    expect(result.session.user).toMatchObject({ username: 'alice', role: 'ADMIN' });
    expect(result.session.user.permissions).toContain('users:manage');
    expect(sessions.sessions).toHaveLength(1);
    expect(sessions.sessions[0]!.tokenHash).toBe(hashSessionToken(result.sessionToken));
    expect(sessions.sessions[0]!.tokenHash).not.toContain(result.sessionToken);
    expect(result.expiresAt.getTime() - clock.now().getTime()).toBe(3600_000);
  });

  it('returns the same error for unknown users and wrong passwords (no enumeration)', async () => {
    const unknown = await auth.login('nobody', 'x').catch((e: unknown) => e);
    const wrong = await auth.login('alice', 'wrong').catch((e: unknown) => e);
    expect(unknown).toMatchObject({ code: 'INVALID_CREDENTIALS', statusCode: 401 });
    expect(wrong).toMatchObject({ code: 'INVALID_CREDENTIALS', statusCode: 401, message: (unknown as Error).message });
    expect(sessions.sessions).toHaveLength(0);
  });

  it('rejects inactive accounts only after the password is verified', async () => {
    users.seed({ username: 'bob', passwordHash: 'hashed:pw', status: 'INACTIVE' });
    await expect(auth.login('bob', 'pw')).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
    await expect(auth.login('bob', 'nope')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('authenticates a valid token and rejects expired or revoked sessions', async () => {
    const { sessionToken } = await auth.login('alice', 'correct-horse');
    expect(await auth.authenticate(sessionToken)).toMatchObject({ username: 'alice' });
    expect(await auth.authenticate('not-a-real-token')).toBeNull();

    clock.advance(3600_000);
    expect(await auth.authenticate(sessionToken)).toBeNull();
    expect(sessions.sessions).toHaveLength(0);
  });

  it('drops sessions of users who were deactivated', async () => {
    const { sessionToken } = await auth.login('alice', 'correct-horse');
    users.users[0]!.status = 'INACTIVE';
    expect(await auth.authenticate(sessionToken)).toBeNull();
    expect(sessions.sessions).toHaveLength(0);
  });

  it('logout deletes only the current session', async () => {
    const a = await auth.login('alice', 'correct-horse');
    await auth.login('alice', 'correct-horse');
    const current = await auth.authenticate(a.sessionToken);
    await auth.logout(current!);
    expect(sessions.sessions).toHaveLength(1);
    expect(await auth.authenticate(a.sessionToken)).toBeNull();
  });

  it('derives a stable CSRF token per session token', async () => {
    const { sessionToken, session } = await auth.login('alice', 'correct-horse');
    expect(auth.csrfTokenFor(sessionToken)).toBe(session.csrfToken);
    expect(auth.csrfTokenFor('other')).not.toBe(session.csrfToken);
  });

  it('purges expired sessions', async () => {
    await auth.login('alice', 'correct-horse');
    clock.advance(7200_000);
    expect(await auth.purgeExpiredSessions()).toBe(1);
  });
});
