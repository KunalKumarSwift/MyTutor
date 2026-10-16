import { CSRF_HEADER } from '@mytutor/contracts';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { loadConfig, type AppConfig } from '../../src/config/env.js';
import { createContainer } from '../../src/container.js';
import { createPrismaClient, type Database } from '../../src/infrastructure/database/prisma.js';
import { Argon2PasswordHasher } from '../../src/shared/security/password-hasher.js';

export const PASSWORD = 'integration-pass-1';

export interface TestContext {
  app: FastifyInstance;
  db: Database;
  config: AppConfig;
}

export async function createTestApp(env: Record<string, string> = {}): Promise<TestContext> {
  const url = process.env['TEST_DATABASE_URL']!;
  const config = loadConfig({
    NODE_ENV: 'test',
    DATABASE_URL: url,
    SESSION_SECRET: 'integration-test-secret-'.padEnd(48, 'x'),
    ALLOWED_ORIGINS: 'http://localhost:5173',
    LOG_LEVEL: 'silent',
    LOGIN_RATE_LIMIT_MAX: '50',
    ...env,
  });
  const db = createPrismaClient(url);
  const app = await buildApp({ config, createContainer: (logger) => createContainer(config, db, logger), logger: false });
  await app.ready();
  return { app, db, config };
}

export async function resetDatabase(db: Database): Promise<void> {
  await db.$executeRawUnsafe(
    'TRUNCATE audit_events, sessions, tutorials, categories, difficulty_levels, users RESTART IDENTITY CASCADE',
  );
}

export interface Fixtures {
  adminId: number;
  operatorId: number;
  categories: { web: number; databases: number; retired: number };
  levels: { beginner: number; advanced: number; hidden: number };
  tutorials: { html: number; sql: number; draft: number; inRetiredCategory: number; inHiddenLevel: number };
}

let cachedHash: string | null = null;

/** Small, known dataset covering every visibility rule. */
export async function seedFixtures(db: Database): Promise<Fixtures> {
  cachedHash ??= await new Argon2PasswordHasher().hash(PASSWORD);
  const admin = await db.user.create({ data: { username: 'admin', passwordHash: cachedHash, role: 'ADMIN', name: 'Admin User', email: 'admin@test.local' } });
  const operator = await db.user.create({ data: { username: 'operator', passwordHash: cachedHash, role: 'OPERATOR', name: 'Operator User' } });

  const cat = (title: string, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') =>
    db.category.create({ data: { title, titleKey: title.toLowerCase(), status } });
  const lvl = (title: string, sortOrder: number, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') =>
    db.difficultyLevel.create({ data: { title, titleKey: title.toLowerCase(), sortOrder, status } });
  const [web, databases, retired] = await Promise.all([cat('Web'), cat('Databases'), cat('Retired', 'INACTIVE')]);
  const [beginner, advanced, hidden] = await Promise.all([lvl('Beginner', 1), lvl('Advanced', 3), lvl('Hidden', 9, 'INACTIVE')]);

  const tut = (title: string, categoryId: number, difficultyLevelId: number, createdAt: string, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') =>
    db.tutorial.create({
      data: { title, description: `${title} body text`, categoryId, difficultyLevelId, status, authorId: admin.id, createdAt: new Date(createdAt) },
    });
  const html = await tut('HTML Basics', web.id, beginner.id, '2026-03-01T10:00:00Z');
  const sql = await tut('Advanced SQL', databases.id, advanced.id, '2026-04-15T10:00:00Z');
  const draft = await tut('Draft Tutorial', web.id, beginner.id, '2026-05-01T10:00:00Z', 'INACTIVE');
  const inRetiredCategory = await tut('Old Stuff', retired.id, beginner.id, '2026-02-01T10:00:00Z');
  const inHiddenLevel = await tut('Secret Level', web.id, hidden.id, '2026-02-10T10:00:00Z');

  return {
    adminId: admin.id,
    operatorId: operator.id,
    categories: { web: web.id, databases: databases.id, retired: retired.id },
    levels: { beginner: beginner.id, advanced: advanced.id, hidden: hidden.id },
    tutorials: { html: html.id, sql: sql.id, draft: draft.id, inRetiredCategory: inRetiredCategory.id, inHiddenLevel: inHiddenLevel.id },
  };
}

export interface Session {
  cookie: string;
  csrf: string;
  headers: Record<string, string>;
}

export async function login(app: FastifyInstance, username: string, password = PASSWORD): Promise<Session> {
  const res = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { username, password } });
  if (res.statusCode !== 200) throw new Error(`Login failed (${res.statusCode}): ${res.body}`);
  const setCookie = res.headers['set-cookie'];
  const raw = Array.isArray(setCookie) ? setCookie[0]! : setCookie!;
  const cookie = raw.split(';')[0]!;
  const csrf = res.json().data.csrfToken as string;
  return { cookie, csrf, headers: { cookie, [CSRF_HEADER]: csrf } };
}
