/**
 * Development seed. Idempotent: reference data and users are upserted; tutorials are only
 * inserted when the tutorials table is empty. Refuses to run in production.
 */
import { createPrismaClient } from '../src/infrastructure/database/prisma.js';
import { Argon2PasswordHasher } from '../src/shared/security/password-hasher.js';
import { titleKey } from '../src/shared/text.js';
import { categories, difficultyLevels, SEED_REFERENCE_DATE, tutorials } from './seed-data.js';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set to seed development users (see .env.example).`);
  return value;
}

async function main() {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('Refusing to seed a production database. Use `npm run admin:create` instead.');
  }
  const databaseUrl = required('DATABASE_URL');
  const db = createPrismaClient(databaseUrl);
  const hasher = new Argon2PasswordHasher();

  try {
    const accounts = [
      {
        key: 'admin' as const,
        username: required('SEED_ADMIN_USERNAME').toLowerCase(),
        password: required('SEED_ADMIN_PASSWORD'),
        role: 'ADMIN' as const,
        name: 'Site Administrator',
        email: 'admin@mytutor.local',
      },
      {
        key: 'operator' as const,
        username: required('SEED_OPERATOR_USERNAME').toLowerCase(),
        password: required('SEED_OPERATOR_PASSWORD'),
        role: 'OPERATOR' as const,
        name: 'Content Operator',
        email: 'operator@mytutor.local',
      },
    ];
    const userIds = {} as Record<'admin' | 'operator', number>;
    for (const account of accounts) {
      const passwordHash = await hasher.hash(account.password);
      const user = await db.user.upsert({
        where: { username: account.username },
        update: { passwordHash, role: account.role, status: 'ACTIVE' },
        create: {
          username: account.username,
          passwordHash,
          role: account.role,
          name: account.name,
          email: account.email,
        },
      });
      userIds[account.key] = user.id;
    }

    const categoryIds = new Map<string, number>();
    for (const c of categories) {
      const data = { title: c.title, titleKey: titleKey(c.title), description: c.description, status: c.status ?? 'ACTIVE' };
      const row = await db.category.upsert({ where: { titleKey: data.titleKey }, update: data, create: data });
      categoryIds.set(c.title, row.id);
    }

    const levelIds = new Map<string, number>();
    for (const l of difficultyLevels) {
      const data = {
        title: l.title,
        titleKey: titleKey(l.title),
        description: l.description,
        status: l.status ?? 'ACTIVE',
        sortOrder: l.sortOrder ?? 0,
      };
      const row = await db.difficultyLevel.upsert({ where: { titleKey: data.titleKey }, update: data, create: data });
      levelIds.set(l.title, row.id);
    }

    const existing = await db.tutorial.count();
    if (existing > 0) {
      console.log(`Tutorials table already has ${existing} rows; skipping tutorial seed.`);
    } else {
      await db.tutorial.createMany({
        data: tutorials.map((t) => {
          const createdAt = new Date(SEED_REFERENCE_DATE - t.daysAgo * 86_400_000);
          return {
            title: t.title,
            description: t.description,
            prerequisites: t.prerequisites ?? null,
            status: t.status ?? 'ACTIVE',
            categoryId: categoryIds.get(t.category)!,
            difficultyLevelId: levelIds.get(t.level)!,
            authorId: userIds[t.author],
            createdAt,
            updatedAt: createdAt,
          };
        }),
      });
      console.log(`Inserted ${tutorials.length} tutorials.`);
    }

    console.log(
      `Seed complete: ${categories.length} categories, ${difficultyLevels.length} difficulty levels, users "${accounts[0]!.username}" (admin) and "${accounts[1]!.username}" (operator).`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
