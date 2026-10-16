import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, login, resetDatabase, seedFixtures, type Fixtures, type Session, type TestContext } from './helpers.js';

describe('Administration API', () => {
  let ctx: TestContext;
  let f: Fixtures;
  let admin: Session;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(async () => {
    await resetDatabase(ctx.db);
    f = await seedFixtures(ctx.db);
    admin = await login(ctx.app, 'admin');
  });
  afterAll(() => ctx.app.close());

  const call = (method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, payload?: object, s: Session = admin) =>
    ctx.app.inject({ method, url, ...(payload ? { payload } : {}), headers: s.headers });

  describe('tutorials', () => {
    const body = () => ({
      title: 'New Tutorial',
      description: 'Line one\n\nLine two',
      prerequisites: 'None',
      categoryId: f.categories.web,
      difficultyLevelId: f.levels.beginner,
    });

    it('supports the full create → read → update → delete lifecycle', async () => {
      const created = await call('POST', '/api/v1/admin/tutorials', body());
      expect(created.statusCode).toBe(201);
      const tutorial = created.json().data;
      expect(tutorial).toMatchObject({ title: 'New Tutorial', status: 'ACTIVE', author: { username: 'admin' }, category: { title: 'Web' } });

      // Published tutorials become publicly visible.
      expect((await ctx.app.inject({ method: 'GET', url: `/api/v1/tutorials/${tutorial.id}` })).statusCode).toBe(200);

      const updated = await call('PATCH', `/api/v1/admin/tutorials/${tutorial.id}`, {
        title: 'Renamed',
        status: 'INACTIVE',
        expectedUpdatedAt: tutorial.updatedAt,
      });
      expect(updated.statusCode).toBe(200);
      expect(updated.json().data).toMatchObject({ title: 'Renamed', status: 'INACTIVE', prerequisites: 'None' });
      expect((await ctx.app.inject({ method: 'GET', url: `/api/v1/tutorials/${tutorial.id}` })).statusCode).toBe(404);

      const stale = await call('PATCH', `/api/v1/admin/tutorials/${tutorial.id}`, { title: 'Again', expectedUpdatedAt: tutorial.updatedAt });
      expect(stale.statusCode).toBe(409);
      expect(stale.json().error.code).toBe('STALE_RECORD');

      expect((await call('DELETE', `/api/v1/admin/tutorials/${tutorial.id}`)).statusCode).toBe(204);
      expect((await call('GET', `/api/v1/admin/tutorials/${tutorial.id}`)).statusCode).toBe(404);
      expect((await call('DELETE', `/api/v1/admin/tutorials/${tutorial.id}`)).statusCode).toBe(404);

      const audit = await ctx.db.auditEvent.findMany({ orderBy: { id: 'asc' } });
      expect(audit.map((a) => a.action)).toEqual(['tutorial.created', 'tutorial.updated', 'tutorial.deleted']);
    });

    it('lists every status for managers, with filters', async () => {
      const all = (await call('GET', '/api/v1/admin/tutorials')).json();
      expect(all.pagination.totalItems).toBe(5);
      const inactive = (await call('GET', '/api/v1/admin/tutorials?status=INACTIVE')).json();
      expect(inactive.data.map((t: { title: string }) => t.title)).toEqual(['Draft Tutorial']);
    });

    it('validates input structurally (400) and semantically (422) without persisting', async () => {
      const missing = await call('POST', '/api/v1/admin/tutorials', { title: '   ', description: '' });
      expect(missing.statusCode).toBe(400);
      expect(missing.json().error.details.map((d: { field: string }) => d.field).sort()).toEqual(
        ['categoryId', 'description', 'difficultyLevelId', 'title'].sort(),
      );

      const badRefs = await call('POST', '/api/v1/admin/tutorials', { ...body(), categoryId: 999_999, difficultyLevelId: f.levels.hidden });
      expect(badRefs.statusCode).toBe(422);
      expect(badRefs.json().error.details).toEqual([
        { field: 'categoryId', message: 'Selected category does not exist.' },
        { field: 'difficultyLevelId', message: 'Selected difficulty level is inactive.' },
      ]);
      expect(await ctx.db.tutorial.count()).toBe(5);

      expect((await call('PATCH', `/api/v1/admin/tutorials/${f.tutorials.html}`, {})).statusCode).toBe(400);
      expect((await call('PATCH', '/api/v1/admin/tutorials/999999', { title: 'x' })).statusCode).toBe(404);
    });

    it('treats submitted markup as plain text (no server-side HTML interpretation)', async () => {
      const res = await call('POST', '/api/v1/admin/tutorials', { ...body(), title: '<script>alert(1)</script>' });
      expect(res.json().data.title).toBe('<script>alert(1)</script>');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('reference data', () => {
    it('creates, updates, rejects duplicates and blocks deletion while in use', async () => {
      const created = await call('POST', '/api/v1/admin/categories', { title: 'Networking', description: 'Packets' });
      expect(created.statusCode).toBe(201);
      const id = created.json().data.id;

      const dup = await call('POST', '/api/v1/admin/categories', { title: '  networking ' });
      expect(dup.statusCode).toBe(409);

      const renamed = await call('PATCH', `/api/v1/admin/categories/${id}`, { title: 'Computer Networking' });
      expect(renamed.json().data.title).toBe('Computer Networking');

      const inUse = await call('DELETE', `/api/v1/admin/categories/${f.categories.web}`);
      expect(inUse.statusCode).toBe(409);
      expect(inUse.json().error.code).toBe('IN_USE');
      expect(await ctx.db.category.count({ where: { id: f.categories.web } })).toBe(1);

      expect((await call('DELETE', `/api/v1/admin/categories/${id}`)).statusCode).toBe(204);
    });

    it('associates a new category with a tutorial and reports usage counts', async () => {
      const cat = (await call('POST', '/api/v1/admin/categories', { title: 'Security' })).json().data;
      await call('PATCH', `/api/v1/admin/tutorials/${f.tutorials.html}`, { categoryId: cat.id });
      const fetched = (await call('GET', `/api/v1/admin/categories/${cat.id}`)).json().data;
      expect(fetched.tutorialCount).toBe(1);
      expect((await call('DELETE', `/api/v1/admin/categories/${cat.id}`)).statusCode).toBe(409);
    });

    it('manages difficulty levels with sort order', async () => {
      const res = await call('POST', '/api/v1/admin/difficulty-levels', { title: 'Intermediate', sortOrder: 2 });
      expect(res.statusCode).toBe(201);
      const list = (await call('GET', '/api/v1/admin/difficulty-levels')).json().data;
      expect(list.map((l: { title: string }) => l.title)).toEqual(['Beginner', 'Intermediate', 'Advanced', 'Hidden']);
      expect((await call('DELETE', `/api/v1/admin/difficulty-levels/${f.levels.beginner}`)).statusCode).toBe(409);
    });

    it('is protected by database constraints even if the service is bypassed', async () => {
      await expect(ctx.db.category.delete({ where: { id: f.categories.web } })).rejects.toMatchObject({ code: 'P2003' });
      await expect(ctx.db.category.create({ data: { title: 'WEB', titleKey: 'web' } })).rejects.toMatchObject({ code: 'P2002' });
      await expect(
        ctx.db.tutorial.create({ data: { title: 't', description: 'd', categoryId: 999_999, difficultyLevelId: f.levels.beginner, authorId: f.adminId } }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });
  });

  describe('users and profile', () => {
    it('creates an operator who can log in, then deactivation revokes their session', async () => {
      const res = await call('POST', '/api/v1/admin/users', {
        username: 'NewOp',
        password: 'operator-pw-1',
        name: 'New Operator',
        email: 'new@example.org',
        dateOfBirth: '1999-04-12',
        gender: 'FEMALE',
      });
      expect(res.statusCode).toBe(201);
      const user = res.json().data;
      expect(user).toMatchObject({ username: 'newop', role: 'OPERATOR', dateOfBirth: '1999-04-12', status: 'ACTIVE' });
      expect(res.body).not.toContain('passwordHash');

      const op = await login(ctx.app, 'newop', 'operator-pw-1');
      const deactivate = await call('PATCH', `/api/v1/admin/users/${user.id}`, { status: 'INACTIVE' });
      expect(deactivate.json().data.status).toBe('INACTIVE');
      expect((await ctx.app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: op.cookie } })).statusCode).toBe(401);

      const dup = await call('POST', '/api/v1/admin/users', { username: 'newop', password: 'operator-pw-1', name: 'X', email: 'x@x.org' });
      expect(dup.statusCode).toBe(409);
    });

    it('validates user input', async () => {
      const res = await call('POST', '/api/v1/admin/users', { username: 'a b', password: 'short', name: '', email: 'not-an-email' });
      expect(res.statusCode).toBe(400);
      expect(res.json().error.details.map((d: { field: string }) => d.field).sort()).toEqual(['email', 'name', 'password', 'username']);
    });

    it('searches users and prevents self-deactivation', async () => {
      const list = (await call('GET', '/api/v1/admin/users?search=oper')).json();
      expect(list.data.map((u: { username: string }) => u.username)).toEqual(['operator']);
      const self = await call('PATCH', `/api/v1/admin/users/${f.adminId}`, { status: 'INACTIVE' });
      expect(self.statusCode).toBe(422);
    });

    it('lets any signed-in user view and update their own profile', async () => {
      const op = await login(ctx.app, 'operator');
      const update = await call('PUT', '/api/v1/profile', { name: 'Renamed Op', email: 'op@example.org', mobile: '+91 98765 43210', address: 'Somewhere' }, op);
      expect(update.statusCode).toBe(200);
      expect(update.json().data).toMatchObject({ name: 'Renamed Op', mobile: '+91 98765 43210', username: 'operator' });
      expect((await call('GET', '/api/v1/profile', undefined, op)).json().data.email).toBe('op@example.org');
    });

    it('changes password: verifies the current one and signs out other sessions', async () => {
      const other = await login(ctx.app, 'admin');
      const wrong = await call('POST', '/api/v1/auth/password', { currentPassword: 'nope', newPassword: 'brand-new-pw' });
      expect(wrong.statusCode).toBe(422);
      const ok = await call('POST', '/api/v1/auth/password', { currentPassword: 'integration-pass-1', newPassword: 'brand-new-pw' });
      expect(ok.statusCode).toBe(204);
      expect((await call('GET', '/api/v1/auth/me')).statusCode).toBe(200);
      expect((await call('GET', '/api/v1/auth/me', undefined, other)).statusCode).toBe(401);
      await login(ctx.app, 'admin', 'brand-new-pw');
    });
  });

  describe('reports and dashboard', () => {
    it('lists tutorials with author/category/level, filtered by an inclusive date range', async () => {
      const all = (await call('GET', '/api/v1/admin/reports/tutorials')).json();
      expect(all.pagination.totalItems).toBe(5);
      expect(all.data[0]).toMatchObject({ tutorialTitle: 'Draft Tutorial', author: { username: 'admin' }, category: 'Web', difficultyLevel: 'Beginner' });

      const ranged = (await call('GET', '/api/v1/admin/reports/tutorials?from=2026-03-01&to=2026-04-15')).json();
      expect(ranged.data.map((r: { tutorialTitle: string }) => r.tutorialTitle)).toEqual(['Advanced SQL', 'HTML Basics']);

      expect((await call('GET', '/api/v1/admin/reports/tutorials?from=2026-05-01&to=2026-04-01')).statusCode).toBe(422);
      expect((await call('GET', '/api/v1/admin/reports/tutorials?from=yesterday')).statusCode).toBe(400);
    });

    it('summarizes the catalogue on the dashboard', async () => {
      await call('POST', '/api/v1/admin/categories', { title: 'Audited' });
      const data = (await call('GET', '/api/v1/admin/dashboard')).json().data;
      expect(data).toMatchObject({ tutorials: { total: 5, active: 4, inactive: 1 }, categories: 4, difficultyLevels: 3, users: 2 });
      expect(data.recentTutorials).toHaveLength(5);
      expect(data.recentActivity[0]).toMatchObject({ action: 'category.created', actor: { username: 'admin' } });
    });
  });
});
