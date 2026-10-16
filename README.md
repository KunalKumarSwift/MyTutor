# MyTutor

A tutorial management and discovery web application — a modernized rebuild of a legacy PHP college
project (preserved in [`legacy/`](legacy)). Visitors browse tutorials by category and difficulty level;
administrators and operators manage the catalogue.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Fastify 5 · PostgreSQL 16 · Prisma 7 ·
Vitest · Playwright — all free and open source.

| | |
| --- | --- |
| Public | Homepage, catalogue with search / category / difficulty filters / sorting / pagination, tutorial details, related tutorials |
| Staff | Dashboard, tutorial CRUD (with concurrency protection), categories, difficulty levels, tutorial report, profile, change password |
| Administrators | Operator accounts: create, edit, reset password, activate/deactivate |
| Security | Argon2id, hashed server-side sessions, CSRF tokens, origin checks, rate limiting, strict CSP, server-side RBAC |
| Quality | 79 API tests, 24 component tests, 20 end-to-end tests; Lighthouse 97–100 performance and 100 accessibility |

## Quick start (local development)

Prerequisites: Node.js ≥ 22.12 and either Docker or a local PostgreSQL 16.

```bash
cp .env.example .env              # then set SESSION_SECRET (command in the file)
docker compose up -d db           # PostgreSQL with mytutor, mytutor_test and mytutor_e2e databases
npm ci                            # install + generate Prisma client + build shared contracts
npm run db:migrate:deploy         # create the schema
npm run db:seed                   # sample catalogue + dev admin/operator from SEED_* in .env
npm run dev                       # API on :3000, web on http://localhost:5173
```

Sign in at <http://localhost:5173/login> with `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`
(or the operator account) from your `.env`. These credentials are for development only.

Without Docker, create a `mytutor` role (password `mytutor`, `CREATEDB`) and the three databases
listed in `scripts/docker/init-test-db.sql`, or point the `*_DATABASE_URL` variables at your own.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API (watch mode) + Vite dev server with `/api` proxy |
| `npm run build` | Build contracts, API (`apps/api/dist`) and web (`apps/web/dist`, pre-compressed) |
| `npm start` | Run the built API; set `WEB_DIST_DIR` to also serve the web app |
| `npm run lint` / `npm run format` / `npm run format:check` | ESLint (zero warnings) / Prettier |
| `npm run typecheck` | Strict TypeScript across all workspaces |
| `npm test` | Unit + integration tests |
| `npm run test:unit` | API unit tests (in-memory fakes) + web component tests |
| `npm run test:integration` | API tests against `TEST_DATABASE_URL` (reset each run) |
| `npm run test:coverage` | API tests with coverage report |
| `npm run test:e2e` | Playwright journeys against `E2E_DATABASE_URL` (requires `npm run build` first) |
| `npm run verify` | Everything CI runs, in order |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Create/apply migrations during development |
| `npm run db:migrate:deploy` | Apply migrations (production / CI) |
| `npm run db:seed` | Seed development data (refuses in production) |
| `npm run db:reset` | Drop, migrate and seed the development database (refuses in production) |
| `npm run admin:create -- --username <name>` | Create or reset an administrator (production-safe) |

For end-to-end tests without the bundled browser download, set `PLAYWRIGHT_CHROMIUM_PATH` to a local
Chromium; otherwise run `npx playwright install chromium` once.

> **Changing dependencies:** `npm ci` works with npm 10, but resolving a *new* dependency tree with
> npm 10.9 currently crashes in npm's resolver for this workspace. Use npm 11 (`npx npm@11 install …`)
> when adding or upgrading packages. npm 11 also asks you to approve install scripts — `prisma`,
> `@prisma/engines` and `esbuild` are approved in `package.json` (`allowScripts`).

## Project layout

```
apps/api            Fastify API · Prisma schema, migrations, seed · admin CLI · tests
apps/web            React SPA · component tests
packages/contracts  Shared DTO types, enums, role → permission table
e2e/                Playwright end-to-end tests
legacy/             Original PHP application (reference only)
docs/               Product, design, API, database, security, performance, deployment docs
```

## Documentation

- [Legacy inventory](docs/legacy-inventory.md) — what the original app did, and where each feature lives now
- [Product requirements](docs/prd.md) · [High-level design](docs/hld.md) · [Low-level design](docs/lld.md)
- [API reference](docs/api.md) · [Database](docs/database.md) · [Security](docs/security.md)
- [Performance results](docs/performance.md) · [Deployment](docs/deployment.md) · [Implementation plan](docs/implementation-plan.md)

## License

Apache-2.0 — see [LICENSE](LICENSE).
