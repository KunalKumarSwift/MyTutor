# API reference

Base path: `/api/v1`. JSON in and out. Every response carries an `x-request-id` header; API responses
are `Cache-Control: no-store`. Request bodies reject unknown properties.

## Conventions

```jsonc
// Single resource
{ "data": { "id": 1, "title": "…" } }
// Collection
{ "data": [/* … */], "pagination": { "page": 1, "pageSize": 12, "totalItems": 25, "totalPages": 3 } }
// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "The request contains invalid fields.",
             "details": [{ "field": "title", "message": "This field is required." }], "requestId": "…" } }
```

- Paging: `page` (≥1), `pageSize` (1–50; defaults 12 public, 20 admin, 25 report).
- Authentication: HttpOnly session cookie set by `POST /auth/login`.
- **CSRF**: every authenticated `POST`/`PUT`/`PATCH`/`DELETE` must send `x-csrf-token` with the
  `csrfToken` returned by `/auth/login` or `/auth/session`. Unsafe requests whose `Origin`/`Referer`
  is neither same-origin nor in `ALLOWED_ORIGINS` are rejected with 403.
- Error codes and statuses: see [lld.md](lld.md#error-model).

## Public

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | `{ data: { status: "ok", database: "ok" } }`, or 503 when the DB is unreachable |
| GET | `/tutorials` | Public tutorials. Query: `search` (title/description, ≤100 chars), `categoryId`, `difficultyLevelId`, `sort` = `newest` \| `oldest` \| `title`, `page`, `pageSize` |
| GET | `/tutorials/:id` | Public tutorial with full `description`; 404 if missing **or not public** |
| GET | `/categories` | Active categories with `tutorialCount` (public tutorials only) |
| GET | `/difficulty-levels` | Active levels ordered by `sortOrder` |

Public tutorial summary:

```json
{ "id": 14, "title": "Preventing SQL Injection", "prerequisites": "Writing SQL queries from application code",
  "excerpt": "SQL injection happens when…", "category": { "id": 3, "title": "Databases" },
  "difficultyLevel": { "id": 2, "title": "Intermediate", "sortOrder": 2 }, "createdAt": "2026-07-17T09:00:00.000Z" }
```

## Authentication & account

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/login` | — | Body `{ username, password }` → `{ data: { user, csrfToken } }` and session cookie. Rate limited per IP + username (`LOGIN_RATE_LIMIT_MAX` per 15 min). |
| POST | `/auth/logout` | session + CSRF | Revokes the session, clears the cookie. 204 |
| GET | `/auth/me` | session | Current principal + CSRF token; **401** when signed out |
| GET | `/auth/session` | — | Same payload, but `{ data: null }` (200) when signed out — used by the SPA on load |
| POST | `/auth/password` | session + CSRF | `{ currentPassword, newPassword (8–128) }`. 204. Signs out other sessions. |
| GET | `/profile` | `profile:manage` | Own profile |
| PUT | `/profile` | `profile:manage` | `{ name, email, dateOfBirth?, gender?, address?, mobile? }` |

Principal: `{ id, username, name, role: "ADMIN" | "OPERATOR", permissions: string[] }`. Never includes
password or token hashes.

## Administration (`/admin`)

| Method | Path | Permission | Notes |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | `tutorials:manage` | Counts, latest tutorials, recent activity; `users` is `null` for operators |
| GET | `/admin/tutorials` | `tutorials:manage` | Same filters as public + `status` |
| GET | `/admin/tutorials/:id` | `tutorials:manage` | Includes `status`, `author`, reference statuses |
| POST | `/admin/tutorials` | `tutorials:manage` | `{ title, description, categoryId, difficultyLevelId, prerequisites?, status? }` → 201 |
| PATCH | `/admin/tutorials/:id` | `tutorials:manage` | Any subset + optional `expectedUpdatedAt` (409 `STALE_RECORD` on conflict) |
| DELETE | `/admin/tutorials/:id` | `tutorials:manage` | 204 |
| GET/POST | `/admin/categories` | `categories:manage` | List (`search`, `status`, paging) / create `{ title, description?, status? }` |
| GET/PATCH/DELETE | `/admin/categories/:id` | `categories:manage` | DELETE → 409 `IN_USE` while tutorials reference it |
| GET/POST | `/admin/difficulty-levels` | `difficultyLevels:manage` | As categories, plus `sortOrder` (0–1000) |
| GET/PATCH/DELETE | `/admin/difficulty-levels/:id` | `difficultyLevels:manage` | |
| GET/POST | `/admin/users` | `users:manage` | List (`search` name/username) / create operator `{ username, password, name, email, … , status? }` |
| GET/PATCH | `/admin/users/:id` | `users:manage` | Update profile, `status`, optional `password` reset (revokes sessions). Cannot deactivate yourself. |
| GET | `/admin/reports/tutorials` | `reports:view` | `from`, `to` (YYYY-MM-DD, inclusive), paging |

Permissions by role are defined once in `packages/contracts/src/permissions.ts`:
operators have every permission except `users:manage`.

## Example session (curl)

```bash
B=http://localhost:3000/api/v1
CSRF=$(curl -s -c jar -H 'content-type: application/json' \
  -d '{"username":"admin","password":"…"}' $B/auth/login | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.csrfToken')
curl -s -b jar -H 'content-type: application/json' -H "x-csrf-token: $CSRF" \
  -d '{"title":"Networking"}' $B/admin/categories
```
