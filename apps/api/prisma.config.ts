import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

// Share the repository-root .env with the Prisma CLI. Real environment variables win.
const rootEnv = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Placeholder keeps `prisma generate` working without a database (e.g. during npm install).
    url: process.env['DATABASE_URL'] ?? 'postgresql://invalid:invalid@localhost:5432/invalid',
  },
});
