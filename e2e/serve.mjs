// Prepares a disposable end-to-end database (reset → migrate → seed) and starts the API,
// which also serves the production web build — the same single-origin setup as production.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = fileURLToPath(new URL('..', import.meta.url));
const apiDir = `${root}apps/api`;
const url = process.env.E2E_DATABASE_URL;
if (!url) throw new Error('E2E_DATABASE_URL is required.');
if (!/e2e|test/i.test(new URL(url).pathname))
  throw new Error('Refusing to reset a database whose name lacks "e2e" or "test".');
if (!existsSync(`${root}apps/web/dist/index.html`))
  throw new Error('Build the web app first: npm run build');

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
await client.end();

const env = { ...process.env, DATABASE_URL: url, NODE_ENV: 'test' };
execFileSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: apiDir, env, stdio: 'inherit' });
execFileSync('npx', ['tsx', 'prisma/seed.ts'], { cwd: apiDir, env, stdio: 'inherit' });

const server = spawn('npx', ['tsx', 'src/server.ts'], { cwd: apiDir, env, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code ?? 0));
