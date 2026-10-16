import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, resetDatabase, seedFixtures, type Fixtures, type TestContext } from './helpers.js';

describe('Public API', () => {
  let ctx: TestContext;
  let f: Fixtures;

  beforeAll(async () => {
    ctx = await createTestApp();
    await resetDatabase(ctx.db);
    f = await seedFixtures(ctx.db);
  });
  afterAll(() => ctx.app.close());

  const get = (url: string) => ctx.app.inject({ method: 'GET', url });

  it('reports health with the database status', async () => {
    const res = await get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: { status: 'ok', database: 'ok' } });
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('lists only tutorials whose own, category and level status are all active', async () => {
    const res = await get('/api/v1/tutorials');
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.map((t: { id: number }) => t.id)).toEqual([f.tutorials.sql, f.tutorials.html]);
    expect(body.pagination).toEqual({ page: 1, pageSize: 12, totalItems: 2, totalPages: 1 });
    expect(body.data[0]).not.toHaveProperty('status');
    expect(body.data[0]).not.toHaveProperty('author');
  });

  it('filters by category, difficulty and search text, and sorts', async () => {
    const byCat = (await get(`/api/v1/tutorials?categoryId=${f.categories.web}`)).json();
    expect(byCat.data.map((t: { title: string }) => t.title)).toEqual(['HTML Basics']);
    const byLevel = (await get(`/api/v1/tutorials?difficultyLevelId=${f.levels.advanced}`)).json();
    expect(byLevel.data.map((t: { title: string }) => t.title)).toEqual(['Advanced SQL']);
    const search = (await get('/api/v1/tutorials?search=html')).json();
    expect(search.data).toHaveLength(1);
    const sorted = (await get('/api/v1/tutorials?sort=title')).json();
    expect(sorted.data.map((t: { title: string }) => t.title)).toEqual(['Advanced SQL', 'HTML Basics']);
    const empty = (await get('/api/v1/tutorials?search=nothing-matches')).json();
    expect(empty).toEqual({ data: [], pagination: { page: 1, pageSize: 12, totalItems: 0, totalPages: 0 } });
  });

  it('paginates and rejects oversized pages', async () => {
    const page2 = (await get('/api/v1/tutorials?pageSize=1&page=2')).json();
    expect(page2.data).toHaveLength(1);
    expect(page2.pagination.totalPages).toBe(2);
    expect((await get('/api/v1/tutorials?pageSize=500')).statusCode).toBe(400);
  });

  it('returns tutorial details, and 404 for hidden or missing tutorials', async () => {
    const res = await get(`/api/v1/tutorials/${f.tutorials.html}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toMatchObject({ title: 'HTML Basics', description: 'HTML Basics body text', category: { title: 'Web' } });
    for (const id of [f.tutorials.draft, f.tutorials.inRetiredCategory, f.tutorials.inHiddenLevel, 999_999]) {
      const hidden = await get(`/api/v1/tutorials/${id}`);
      expect(hidden.statusCode).toBe(404);
      expect(hidden.json().error.code).toBe('NOT_FOUND');
    }
  });

  it('rejects malformed identifiers and unknown query parameters with 400', async () => {
    expect((await get('/api/v1/tutorials/abc')).statusCode).toBe(400);
    const res = await get('/api/v1/tutorials?evil=1');
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatchObject({ code: 'VALIDATION_ERROR', details: [{ field: 'evil' }] });
  });

  it('lists active categories with public tutorial counts and ordered difficulty levels', async () => {
    const categories = (await get('/api/v1/categories')).json().data;
    expect(categories).toEqual([
      expect.objectContaining({ title: 'Databases', tutorialCount: 1 }),
      expect.objectContaining({ title: 'Web', tutorialCount: 1 }),
    ]);
    const levels = (await get('/api/v1/difficulty-levels')).json().data;
    expect(levels.map((l: { title: string }) => l.title)).toEqual(['Beginner', 'Advanced']);
  });

  it('returns a JSON 404 envelope for unknown API routes', async () => {
    const res = await get('/api/v1/nope');
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
  });

  it('sets security headers', async () => {
    const res = await get('/api/v1/health');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('returns a generic 500 without leaking internals on unexpected failures', async () => {
    const original = ctx.app.container.tutorials.listPublicTutorials;
    ctx.app.container.tutorials.listPublicTutorials = async () => {
      throw new Error('relation "secret_table" does not exist');
    };
    try {
      const res = await get('/api/v1/tutorials');
      expect(res.statusCode).toBe(500);
      expect(res.json().error).toMatchObject({ code: 'INTERNAL_ERROR' });
      expect(res.body).not.toContain('secret_table');
    } finally {
      ctx.app.container.tutorials.listPublicTutorials = original;
    }
  });
});
