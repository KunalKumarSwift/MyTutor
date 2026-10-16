import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

/** Recreates the dedicated test database schema and applies all migrations once per run. */
export default async function setup() {
  const url = process.env['TEST_DATABASE_URL'];
  if (!url) throw new Error('TEST_DATABASE_URL must be set for integration tests (see .env.example).');
  const dbName = new URL(url).pathname.slice(1);
  if (!/test/i.test(dbName)) {
    throw new Error(`Refusing to reset "${dbName}": the integration test database name must contain "test".`);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  } finally {
    await client.end();
  }

  const apiDir = fileURLToPath(new URL('../..', import.meta.url));
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: apiDir,
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
}
