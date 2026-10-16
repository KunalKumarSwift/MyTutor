# Product requirements (as built)

MyTutor is a tutorial management and discovery web application: visitors browse a catalogue of
tutorials organised by category and difficulty level; staff (administrators and operators) manage
that catalogue. This document records the scope that was implemented. The full original
specification is the project brief; the legacy evidence is in [legacy-inventory.md](legacy-inventory.md).

## Users

| Role | Description |
| --- | --- |
| Guest | Unauthenticated visitor. Browses active tutorials. Not a stored role. |
| Operator | Staff account. Manages tutorials, categories, difficulty levels; views the report; edits own profile and password. |
| Administrator | Everything an operator can do, plus managing operator accounts. |

## Functional requirements

| ID | Requirement | Status | Where |
| --- | --- | --- | --- |
| FR-001 | Public homepage and navigation | Done | `HomePage.tsx`, `PublicLayout.tsx` |
| FR-002 | Browse publicly visible tutorials | Done | `GET /tutorials`, `CatalogPage.tsx` |
| FR-003 | Tutorial details | Done | `GET /tutorials/:id`, `TutorialDetailPage.tsx` |
| FR-004 | Category and difficulty associations | Done | FK-constrained `tutorials.categoryId` / `difficultyLevelId` |
| FR-005 | Secure staff authentication | Done | Argon2id + hashed opaque sessions + CSRF ([security.md](security.md)) |
| FR-006 | Tutorial CRUD | Done | `/admin/tutorials`, `TutorialFacade` |
| FR-007 | Category management | Done | `/admin/categories` |
| FR-008 | Difficulty-level management | Done | `/admin/difficulty-levels` |
| FR-009 | Server-side authorization | Done | `AuthorizationPolicy`, route pre-handlers + facade checks |
| FR-010 | Migrations and seed data | Done | `apps/api/prisma/migrations`, `prisma/seed.ts` |
| FR-011 | Search, filters, pagination | Done | Public and admin lists; page size capped at 50 |
| FR-012 | User/profile management | Done | `/admin/users`, `/profile`, `/auth/password` |
| FR-013 | Operator workflows | Done | Operator role with distinct permissions |
| FR-014 | Tutorial report | Done | `/admin/reports/tutorials` |
| FR-015 | Responsive, accessible UI | Done | Lighthouse a11y 100; E2E viewport checks 320–1280 px |
| FR-016 | Unit and integration tests | Done | `apps/api/tests`, `apps/web/tests` |
| FR-017 | End-to-end tests | Done | `e2e/` (journeys E2E-001…008) |
| FR-018 | Build and deployment docs | Done | [deployment.md](deployment.md), README |

## Business rules

- A tutorial is **public** only when the tutorial, its category and its difficulty level are all `ACTIVE`.
- Category and difficulty-level titles are unique, ignoring case and repeated spaces.
- New or changed tutorial assignments must reference an **active** category and level; a tutorial may
  keep a reference that was deactivated after it was assigned.
- A category or difficulty level that is used by any tutorial cannot be deleted (deactivate it instead).
  Enforced by the service and by `ON DELETE RESTRICT` foreign keys.
- Tutorials are hard-deleted after confirmation. Users are never deleted; deactivation signs them out.
- Administrators create **operator** accounts (legacy rule). Administrators are provisioned with
  `npm run admin:create`. An administrator cannot deactivate their own account.
- Changing or resetting a password revokes the affected user's other sessions.
- The tutorial description is plain text; paragraphs are separated by blank lines.

## Non-goals (not present in the legacy app, not built)

Payments, subscriptions, media uploads/hosting, progress tracking, certificates, quizzes, AI content,
chat, native apps, microservices, LMS integrations, About/Contact pages (dead links in legacy),
self-service password recovery by e-mail.

## Non-functional targets and results

Measured on the production build; see [performance.md](performance.md) for method and raw numbers.

| Target | Result |
| --- | --- |
| Lighthouse performance ≥ 90 | 97–98 mobile, 100 desktop |
| Lighthouse accessibility ≥ 95 | 100 on all measured pages |
| LCP ≤ 2.5 s (throttled mobile) | 1.9–2.3 s |
| CLS ≤ 0.1 | 0–0.026 |
| Initial JS ≈ 200 KB compressed or less | 99 KiB brotli (113 KiB gzip) |
