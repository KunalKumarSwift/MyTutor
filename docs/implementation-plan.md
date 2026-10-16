# Implementation plan and status

| Phase | Scope | Status | Evidence |
| --- | --- | --- | --- |
| 0 — Legacy discovery | Read all 57 PHP files; reconstruct schema, roles, workflows, defects | Done | [legacy-inventory.md](legacy-inventory.md) |
| 1 — Foundation | Workspaces, strict TS, config validation, Prisma 7 + migrations, error envelope, health, lint/format, CI | Done | `apps/api/src/{config,plugins,shared}`, `.github/workflows/ci.yml` |
| 2 — Auth & authorization | Argon2id, hashed sessions, CSRF, origin checks, rate limiting, policy, `/auth/*` | Done | `modules/auth`, `auth-api.test.ts` |
| 3 — Public experience | Design tokens, home, catalogue (filters/search/sort/paging), detail, empty/error/404 states | Done | `apps/web/src/features/{home,tutorials}` |
| 4 — Administration | Dashboard, tutorial CRUD, categories, difficulty levels | Done | `apps/web/src/features/admin`, `admin-api.test.ts` |
| 5 — Legacy-specific | Operator role, user management, profile, change password, tutorial report | Done | `modules/users`, `modules/reports` |
| 6 — Polish & performance | Reveal/parallax with reduced-motion, compression, CLS/a11y fixes, measurement | Done | [performance.md](performance.md) |
| 7 — Release readiness | E2E journeys, docs, deployment guide, verified fresh install | Done | `e2e/`, this folder |

Each phase was verified with the relevant tests, type checking and linting before moving on.
