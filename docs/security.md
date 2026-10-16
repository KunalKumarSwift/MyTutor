# Security

## Threat summary and controls

| Threat | Control | Where |
| --- | --- | --- |
| Credential theft from the database | Argon2id (19 MiB, t=2, p=1 — OWASP minimum); parameters stored per hash so they can be raised | `shared/security/password-hasher.ts` |
| Session theft from the database | Only `sha256(token)` stored; tokens are 256-bit random | `shared/security/tokens.ts`, `sessions.tokenHash` |
| Session hijacking via XSS | Cookie is `HttpOnly`; strict CSP (`script-src 'self'`, no inline scripts/styles, no `data:` fonts) | `plugins/auth.plugin.ts`, `app.ts` |
| CSRF | Session-bound token (`HMAC(SESSION_SECRET, token)`) required in `x-csrf-token` on every authenticated mutation; `SameSite=Lax`; Origin/Referer allow-list on all unsafe API requests (incl. login); JSON-only bodies | `auth.plugin.ts` |
| Brute force | Login rate limit per IP + username (default 10 / 15 min); global API limit (default 600 / min / IP) | `auth.routes.ts`, `app.ts` |
| Account enumeration | Identical message/status for unknown user and wrong password; dummy Argon2 verify for unknown users; "inactive" only revealed after a correct password | `auth.service.ts` |
| Privilege escalation | Permissions checked in route pre-handlers **and** again in facades; operators cannot reach `/admin/users*`; role cannot be set via the API; admins cannot deactivate themselves | `AuthorizationPolicy`, facades |
| SQL injection | Prisma parameterized queries only; no raw SQL with user input | repositories |
| Stored XSS | All user text rendered by React as text; descriptions are plain text, never HTML | web app |
| Mass assignment / unexpected fields | `additionalProperties: false` on all bodies and query strings → 400 | route schemas |
| Data leakage in responses | DTO mappers + response schemas (serializer drops unknown fields); no password/token hashes ever returned | mappers, `dto-schemas.ts` |
| Information disclosure in errors | Central handler: stable codes, generic 500 message, request ID; details only logged server-side | `error-handler.ts` |
| Sensitive data in logs | Pino redacts cookies, authorization, CSRF header and `set-cookie`; passwords are never logged | `app.ts` |
| Stale access after offboarding | Deactivation and password reset delete sessions; every request re-checks the user is active | `user.facade.ts`, `auth.service.ts` |
| Open redirect after login | Only same-app paths (`/…`, not `//…`) are accepted | `LoginPage.tsx#safeRedirect` |
| Clickjacking | `frame-ancestors 'none'` (CSP) and `X-Frame-Options` | helmet |
| Transport | `COOKIE_SECURE=true` required in production; `__Host-` cookie prefix; HSTS in production | `config/env.ts`, `app.ts` |
| Misconfiguration | Startup validation: production requires secure cookies, a non-placeholder secret ≥ 32 chars and `ALLOWED_ORIGINS` | `config/env.ts` |
| Vulnerable dependencies | Pinned lockfile; `npm audit` reports 0 known vulnerabilities at time of writing | `package-lock.json` |

## Cookie and CSRF design

The app is deployed **single-origin** (API serves the SPA), so the session cookie never needs to be
cross-site. Defences are layered: `SameSite=Lax` stops cross-site cookies on POST; the Origin check
rejects foreign pages even on same-site subdomains; the CSRF header cannot be set by a cross-origin
form. CORS is not enabled at all — browsers therefore block cross-origin reads of API responses.

## Operational guidance

- **Secrets**: set `SESSION_SECRET` from a secret manager (≥ 32 random chars). Never commit `.env`.
- **Rotating `SESSION_SECRET`** invalidates every CSRF token; users must reload, and existing sessions
  continue to work. To force everyone to sign in again, also run `DELETE FROM sessions;`.
- **Revoking one user**: deactivate them in Users (or reset their password).
- **Initial administrator**: `npm run admin:create -- --username <name>`; the password is prompted
  (hidden) or read from `MYTUTOR_ADMIN_PASSWORD`, never passed on the command line.
- **Audit**: tutorial, category, difficulty-level and user changes and password changes are recorded in
  `audit_events` (actor, action, entity, summary — never secrets).
- Keep dependencies patched (`npm audit`, Dependabot or similar) and re-run CI before deploying.

## Known limitations

- No self-service password recovery (requires e-mail delivery); administrators reset passwords.
- No multi-factor authentication.
- The rate limiter stores counters in memory: with several API instances behind a load balancer,
  configure `@fastify/rate-limit` with a shared store (e.g. Redis).
- Audit writes happen after the primary change; an audit failure is logged but does not roll back.
