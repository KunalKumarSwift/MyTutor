import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, login, PASSWORD, resetDatabase, seedFixtures, type TestContext } from './helpers.js';

describe('Authentication & authorization API', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(async () => {
    await resetDatabase(ctx.db);
    await seedFixtures(ctx.db);
  });
  afterAll(() => ctx.app.close());

  const post = (url: string, payload: unknown, headers: Record<string, string> = {}) =>
    ctx.app.inject({ method: 'POST', url, payload: payload as object, headers });

  it('logs in, sets a hardened session cookie, and resolves /auth/me', async () => {
    const res = await post('/api/v1/auth/login', { username: 'ADMIN', password: PASSWORD });
    expect(res.statusCode).toBe(200);
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/^mytutor_session=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    expect(res.json().data.user).toEqual({
      id: expect.any(Number),
      username: 'admin',
      name: 'Admin User',
      role: 'ADMIN',
      permissions: expect.arrayContaining(['users:manage']),
    });
    expect(res.body).not.toMatch(/passwordHash|tokenHash/);

    const session = await login(ctx.app, 'admin');
    const me = await ctx.app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: session.cookie } });
    expect(me.statusCode).toBe(200);
    expect(me.json().data).toMatchObject({ user: { username: 'admin' }, csrfToken: session.csrf });
  });

  it('stores only a hash of the session token', async () => {
    const session = await login(ctx.app, 'admin');
    const token = session.cookie.split('=')[1]!;
    const rows = await ctx.db.session.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokenHash).not.toBe(token);
  });

  it('fails safely with identical responses for unknown users and wrong passwords', async () => {
    const unknown = await post('/api/v1/auth/login', { username: 'ghost', password: 'whatever' });
    const wrong = await post('/api/v1/auth/login', { username: 'admin', password: 'wrong-password' });
    expect(unknown.statusCode).toBe(401);
    expect(wrong.statusCode).toBe(401);
    expect(unknown.json().error.message).toBe(wrong.json().error.message);
    expect(unknown.headers['set-cookie']).toBeUndefined();
  });

  it('rejects deactivated accounts', async () => {
    await ctx.db.user.update({ where: { username: 'operator' }, data: { status: 'INACTIVE' } });
    const res = await post('/api/v1/auth/login', { username: 'operator', password: PASSWORD });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('ACCOUNT_INACTIVE');
  });

  it('rate limits repeated login attempts per username and IP', async () => {
    // Dedicated instance so the strict limit does not affect other tests' logins.
    const limited = await createTestApp({ LOGIN_RATE_LIMIT_MAX: '5' });
    try {
      const attempt = (username: string, password: string) =>
        limited.app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { username, password } });
      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) statuses.push((await attempt('ratelimited', 'bad')).statusCode);
      expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
      expect(statuses[5]).toBe(429);
      // A different account from the same IP is unaffected.
      expect((await attempt('admin', PASSWORD)).statusCode).toBe(200);
    } finally {
      await limited.app.close();
    }
  });

  it('logout revokes the session server-side', async () => {
    const s = await login(ctx.app, 'admin');
    const out = await post('/api/v1/auth/logout', {}, s.headers);
    expect(out.statusCode).toBe(204);
    expect(String(out.headers['set-cookie'])).toMatch(/mytutor_session=;/);
    const me = await ctx.app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: s.cookie } });
    expect(me.statusCode).toBe(401);
    expect(await ctx.db.session.count()).toBe(0);
  });

  it('requires the CSRF token on authenticated state-changing requests', async () => {
    const s = await login(ctx.app, 'admin');
    const noToken = await post('/api/v1/admin/categories', { title: 'X' }, { cookie: s.cookie });
    expect(noToken.statusCode).toBe(403);
    expect(noToken.json().error.code).toBe('CSRF_INVALID');
    const badToken = await post('/api/v1/admin/categories', { title: 'X' }, { cookie: s.cookie, 'x-csrf-token': 'forged' });
    expect(badToken.statusCode).toBe(403);
    expect((await post('/api/v1/admin/categories', { title: 'X' }, s.headers)).statusCode).toBe(201);
  });

  it('rejects state-changing requests from disallowed origins', async () => {
    const s = await login(ctx.app, 'admin');
    const res = await post('/api/v1/admin/categories', { title: 'X' }, { ...s.headers, origin: 'https://evil.example' });
    expect(res.statusCode).toBe(403);
    const allowed = await post('/api/v1/admin/categories', { title: 'Y' }, { ...s.headers, origin: 'http://localhost:5173' });
    expect(allowed.statusCode).toBe(201);
    const forgedLogin = await post('/api/v1/auth/login', { username: 'admin', password: PASSWORD }, { origin: 'https://evil.example' });
    expect(forgedLogin.statusCode).toBe(403);
  });

  it('returns 401 for every protected endpoint without a session', async () => {
    const endpoints: Array<[string, string]> = [
      ['GET', '/api/v1/auth/me'],
      ['POST', '/api/v1/auth/logout'],
      ['POST', '/api/v1/auth/password'],
      ['GET', '/api/v1/profile'],
      ['PUT', '/api/v1/profile'],
      ['GET', '/api/v1/admin/dashboard'],
      ['GET', '/api/v1/admin/tutorials'],
      ['GET', '/api/v1/admin/tutorials/1'],
      ['POST', '/api/v1/admin/tutorials'],
      ['PATCH', '/api/v1/admin/tutorials/1'],
      ['DELETE', '/api/v1/admin/tutorials/1'],
      ['GET', '/api/v1/admin/categories'],
      ['POST', '/api/v1/admin/categories'],
      ['PATCH', '/api/v1/admin/categories/1'],
      ['DELETE', '/api/v1/admin/categories/1'],
      ['GET', '/api/v1/admin/difficulty-levels'],
      ['POST', '/api/v1/admin/difficulty-levels'],
      ['PATCH', '/api/v1/admin/difficulty-levels/1'],
      ['DELETE', '/api/v1/admin/difficulty-levels/1'],
      ['GET', '/api/v1/admin/users'],
      ['GET', '/api/v1/admin/users/1'],
      ['POST', '/api/v1/admin/users'],
      ['PATCH', '/api/v1/admin/users/1'],
      ['GET', '/api/v1/admin/reports/tutorials'],
    ];
    for (const [method, url] of endpoints) {
      const res = await ctx.app.inject({ method: method as 'GET', url, payload: method === 'GET' ? undefined : {} });
      // Body validation may run first for some routes; neither path may succeed.
      expect([400, 401], `${method} ${url}`).toContain(res.statusCode);
      if (method === 'GET' || method === 'DELETE') expect(res.statusCode, `${method} ${url}`).toBe(401);
    }
  });

  it('forbids operators from user management but allows their other screens', async () => {
    const s = await login(ctx.app, 'operator');
    for (const url of ['/api/v1/admin/users', '/api/v1/admin/users/1']) {
      const res = await ctx.app.inject({ method: 'GET', url, headers: s.headers });
      expect(res.statusCode, url).toBe(403);
      expect(res.json().error.code).toBe('FORBIDDEN');
    }
    const create = await post('/api/v1/admin/users', { username: 'x1x', password: 'password1', name: 'X', email: 'x@x.org' }, s.headers);
    expect(create.statusCode).toBe(403);
    for (const url of ['/api/v1/admin/tutorials', '/api/v1/admin/categories', '/api/v1/admin/difficulty-levels', '/api/v1/admin/reports/tutorials']) {
      expect((await ctx.app.inject({ method: 'GET', url, headers: s.headers })).statusCode, url).toBe(200);
    }
    const dashboard = (await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/dashboard', headers: s.headers })).json();
    expect(dashboard.data.users).toBeNull();
  });

  it('expires sessions after their TTL', async () => {
    const s = await login(ctx.app, 'admin');
    await ctx.db.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    const me = await ctx.app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: s.cookie } });
    expect(me.statusCode).toBe(401);
    expect(await ctx.db.session.count()).toBe(0);
  });
});
