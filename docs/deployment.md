# Deployment

MyTutor deploys as **one Node.js process** (API + built SPA on the same origin) plus **PostgreSQL**.
Nothing paid is required; any host that runs Node 22 and PostgreSQL 16 works (a VM, a container
platform, or a PaaS with managed Postgres). Free tiers change often — check current limits and
data-retention terms before relying on one.

## Requirements

- Node.js ≥ 22.12, npm ≥ 10.9
- PostgreSQL 16 (14+ is expected to work but is not tested)
- HTTPS termination (reverse proxy such as Caddy/nginx, or the platform's load balancer)

## Build

```bash
npm ci                 # installs, generates the Prisma client, builds packages/contracts
npm run build          # contracts → api (tsc → apps/api/dist) → web (vite → apps/web/dist, + .br/.gz)
```

## Configure (environment variables)

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOST` / `PORT` | e.g. `0.0.0.0` / `3000` |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/mytutor?schema=public` (add `sslmode=require` for managed DBs) |
| `SESSION_SECRET` | ≥ 32 random characters from a secret manager |
| `SESSION_TTL_SECONDS` | default `28800` (8 h) |
| `ALLOWED_ORIGINS` | the public origin, e.g. `https://tutor.example.org` |
| `COOKIE_SECURE` | `true` (required when `NODE_ENV=production`) |
| `TRUST_PROXY` | `true` when behind a proxy/load balancer that sets `X-Forwarded-*` |
| `WEB_DIST_DIR` | absolute path to `apps/web/dist` |
| `LOG_LEVEL` | `info` |
| `LOGIN_RATE_LIMIT_MAX`, `API_RATE_LIMIT_MAX` | optional overrides (defaults 10 / 15 min and 600 / min) |

The process refuses to start with an unsafe production configuration.

## Release procedure

```bash
pg_dump --format=custom --file=backup-$(date +%F).dump "$DATABASE_URL"   # 1. back up
npm ci && npm run build                                                 # 2. build the release
npm run db:migrate:deploy                                               # 3. apply migrations
npm start                                                               # 4. start (node apps/api/dist/server.js)
```

First deployment only — create the first administrator:

```bash
npm run admin:create -- --username alice --name "Alice Doe" --email alice@example.org
# prompts for the password; or set MYTUTOR_ADMIN_PASSWORD in the environment for automation
```

Health check: `GET /api/v1/health` → 200 when the database is reachable, 503 otherwise.
Logs are JSON (pino) on stdout with a request ID per line; cookies and CSRF headers are redacted.

## Reverse proxy example (Caddy)

```caddyfile
tutor.example.org {
  reverse_proxy 127.0.0.1:3000
}
```

Caddy obtains TLS certificates automatically. Set `TRUST_PROXY=true`.

## Rollback

- Code: redeploy the previous build. Migrations are additive in this release, so older code runs on the
  newer schema.
- Data: restore the pre-release dump with `pg_restore --clean --if-exists --dbname="$DATABASE_URL" backup-….dump`.

## Running several instances

The app is stateless apart from PostgreSQL, except for the in-memory rate-limit counters. Before scaling
horizontally, give `@fastify/rate-limit` a shared store (e.g. Redis) in `app.ts`.

## Maintenance

- Expired sessions are purged hourly by the running server.
- Keep dependencies patched: `npm audit`, update, `npm run verify`, deploy.
- Back up the database on a schedule and test restores.

## Not provided

No Dockerfile is included because it could not be built and verified in the environment this release
was produced in. `docker-compose.yml` provides PostgreSQL for local development only.
