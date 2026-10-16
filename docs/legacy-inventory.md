# Legacy feature inventory

This inventory is based on reading every file of the original PHP application, now preserved
unchanged in [`legacy/`](../legacy). Nothing here is inferred from the specification alone.

## 1. What the legacy code is

| Item | Finding |
| --- | --- |
| Stack | PHP 5.3 (NetBeans project, `legacy/nbproject`), `mysql_*` extension, MySQL on `127.0.0.1:3307`, database `MyTutor` |
| Entry point | `legacy/index.php` → redirects to `guest/index.php` |
| Layout | Table-based XHTML; shared `include/header.php`, `topmenu.php`, `leftmenu.php`, `footer.php`, `sitestyle.css`; header text “Online Tutorial” in orange `#cc3300` / blue `#0099cc` |
| Size | 57 PHP files, 3,748 lines; `admin/` and `operator/` pages mostly `include` shared pages from `Common/` |
| Schema file | **None in the archive.** The schema below is reconstructed from the SQL statements in the pages. |

## 2. Reconstructed database

| Legacy table | Columns used by the code | Notes |
| --- | --- | --- |
| `tbluser` | `usrId` (login id, string, PK by usage), `usrPwd`, `usrType` (`Admin`/`Operator`), `usrStatus` (`Active`/`Inactive`), `usrName`, `usrDOB`, `usrGender` (`Male`/`Female`), `usrEmail`, `usrAddress`, `usrMobile` | Passwords stored and compared **in plain text** |
| `tblcategory` | `categoryId` (numeric, auto), `categoryTitle`, `categoryDesc`, `categoryStatus` (`Active`/`Inactive`) | Duplicate title checked on insert only |
| `tbldifficultylevel` | `difficultyLevelId`, `difficultyLevelTitle`, `difficultyLevelDesc`, `difficultyLevelStatus` | Same pattern as categories |
| `tbltutorial` | `tutorialId`, `tutorialTitle`, `tutorialDesc`, `categoryId`, `difficultyLevelId`, `tutorialPrerequisites`, `tutorialCreateDate` (`now()` at insert), `tutorialStatus`, `usrId` (creator) | Joined to category, level and user in views and the report |

## 3. Roles and permissions (as implemented)

| Capability | Guest | Operator | Admin | Evidence |
| --- | :-: | :-: | :-: | --- |
| View tutorial list / detail | ✓ | – | – | `guest/ViewTutorial.php`, `guest/ViewTutorialDetail.php` |
| Sign in | ✓ | | | `guest/Login.php` (also `admin/Login.php`) routes by `usrType` |
| Manage tutorials | | ✓ | ✓ | `operator/*Tutorial.php`, `admin/*Tutorial.php` → `Common/` |
| Manage categories / difficulty levels | | ✓ | ✓ | `operator/` and `admin/` both include `Common/Manage*.php` |
| Edit own profile, change password | | ✓ | ✓ | `Common/ManageProfile.php`, `Common/ChangePassword.php` |
| Tutorial report | | ✓ (menu) | ✓ (menu) | `include/leftmenu.php`; page exists only in `Common/` |
| Manage users | | | ✓ | `admin/ManageUser.php`, `AddUser.php`, `EditUser.php` (no operator equivalent) |

Operators are therefore **not** equivalent to administrators: the only difference is user management.

## 4. Page-by-page feature matrix

| Legacy page(s) | Behaviour verified in code | Status in rebuild | New location |
| --- | --- | --- | --- |
| `guest/index.php` | Static “Guest Home” label | **Replaced** by a real homepage (intro, categories, recent tutorials) | `apps/web/src/features/home/HomePage.tsx` |
| `guest/ViewTutorial.php` | Category + level dropdowns, table of title/prerequisites, “Proceed” link. **Lists every tutorial regardless of status.** | **Retained + fixed**: only active tutorials in active categories/levels; added search, sort, pagination | `GET /api/v1/tutorials`, `CatalogPage.tsx` |
| `guest/ViewTutorialDetail.php` | Title, create date, category, level, prerequisites (description **not shown**) | **Retained + extended**: also shows the description (the tutorial body admins enter) and related tutorials; 404 for hidden/missing | `GET /api/v1/tutorials/:id`, `TutorialDetailPage.tsx` |
| `guest/Login.php`, `admin/Login.php`, `operator/Login.php` | Lookup by `usrId`, plaintext compare, `Active` check (“your login has been Expired.”), redirect by type | **Retained, secured**: Argon2id, hashed DB sessions, rate limiting, CSRF; one login page | `POST /api/v1/auth/login`, `LoginPage.tsx` |
| `Common/Logout.php` | `session_destroy()` | **Retained**: server-side session revocation | `POST /api/v1/auth/logout` |
| `admin/index.php`, `operator/index.php` | Static “Admin Home” label | **Replaced** by a dashboard with real counts and recent activity | `GET /api/v1/admin/dashboard`, `DashboardPage.tsx` |
| `Common/ManageTutorial.php` | Search by title + category + level; table with status; Edit link; Add New | **Retained**: plus status filter, pagination, delete | `GET /api/v1/admin/tutorials`, `ManageTutorialsPage.tsx` |
| `Common/AddTutorial.php` | Title, category, level, prerequisites, description, status; sets create date and `usrId`; “Save” and “Save & Add New” buttons (the latter rendered but **not handled**) | **Retained**: both buttons work; references must exist and be active | `POST /api/v1/admin/tutorials`, `TutorialFormPage.tsx` |
| `Common/EditTutorial.php` | Edit all fields; dropdowns list active categories/levels | **Retained**: partial updates, optimistic concurrency, unsaved-changes guard | `PATCH /api/v1/admin/tutorials/:id` |
| `Common/ManageCategory.php`, `AddCategory.php`, `EditCategory.php` | Search by title; add with duplicate check; edit title/desc/status | **Retained**: duplicate check on edit too (case-insensitive); delete added (blocked while used) | `/api/v1/admin/categories`, `ReferenceManagePage.tsx` |
| `Common/ManageDifficultyLevel.php`, `Add…`, `Edit…` | Same as categories | **Retained** + `sortOrder` so levels list Beginner → Advanced | `/api/v1/admin/difficulty-levels` |
| `Common/ManageProfile.php` | Edit own name, DOB, gender, address, mobile, email (all required) | **Retained** (name and email required; others optional) | `GET/PUT /api/v1/profile`, `ProfilePage.tsx` |
| `Common/ChangePassword.php` | Form only — **no handler; did nothing** | **Implemented**: verifies current password, revokes other sessions | `POST /api/v1/auth/password`, `ChangePasswordPage.tsx` |
| `admin/ManageUser.php` | Search by name; table; “CHANGE” toggles Active/Inactive; EDIT link | **Retained**: toggle revokes sessions; cannot deactivate yourself | `GET/PATCH /api/v1/admin/users`, `ManageUsersPage.tsx` |
| `admin/AddUser.php` | Creates **Operator** accounts only; duplicate `usrId` check; profile fields | **Retained** (still operators only) | `POST /api/v1/admin/users`, `UserFormPage.tsx` |
| `admin/EditUser.php` | Edit status/profile and **overwrite password** (blank wipes it) | **Retained + fixed**: password optional; reset revokes sessions | `PATCH /api/v1/admin/users/:id` |
| `Common/TutorialReport.php` | Join user/tutorial/category/level; optional `BETWEEN` date range; columns user id, name, category, title, level, create date. Linked from menus but **no `admin/` or `operator/` page existed** (dead link) | **Retained and made reachable** for both roles; inclusive date range; pagination | `GET /api/v1/admin/reports/tutorials`, `TutorialReportPage.tsx` |
| `admin/ForgotPassword.php`, `operator/ForgotPassword.php`, `guest/Login` “Forgot” link | Shows the user’s **plaintext password on screen** given id + email | **Removed** (insecure; no e-mail infrastructure). Replaced by administrator password reset and the `admin:create` CLI | `UserFormPage.tsx`, `apps/api/scripts/create-admin.ts` |
| About Us / Contact Us menu items | Linked from every menu; **pages do not exist** | **Excluded** (no content to recover; not fabricated) | — |
| `*/checksession.php` | Role check — **commented out on almost every page**; condition logic also inverted (`!isset(...) && ... !=`) | **Replaced** by server-side authorization on every endpoint | `AuthorizationPolicy`, `auth.plugin.ts` |
| “Source” / “Design” buttons on tutorial forms, `images/SourceIcon.png`, `DesignIcon.png` | Rendered, no JavaScript attached — an unfinished rich-text editor | **Excluded**; description is plain text with paragraph breaks | — |
| `<<` / `>>` buttons on manage pages | Rendered, no handler | **Implemented** as real server-side pagination | `Pagination.tsx` |

## 5. Security and correctness problems found in the legacy code

1. SQL injection in every query (raw `$_POST`/`$_GET` concatenated into SQL).
2. Plaintext password storage and comparison; Forgot Password discloses passwords.
3. Authorization checks commented out — any visitor could open admin/operator pages directly.
4. Stored XSS: all database values echoed without escaping.
5. Database credentials hard-coded in `include/settings.php` (`root` / `student`).
6. Guest catalogue shows inactive tutorials.
7. `EditUser` overwrites the password with whatever is in the (empty-by-default) field.
8. Dead links (About, Contact, report pages) and inert buttons (Source, Design, paging).
9. N+1 queries in `ManageTutorial` (two lookups per row).

All are addressed in the rebuild (see [security.md](security.md)).

## 6. Intentional changes and assumptions

| Decision | Reason |
| --- | --- |
| Login stays by **User ID** (username), not e-mail | Legacy login used `usrId`; e-mail was an optional profile field |
| `Active`/`Inactive` status kept on all four entities and used as the publication flag | It is the legacy model; no separate draft/published state was introduced |
| Tutorials can be **hard-deleted**; categories/levels only when unused; users are never deleted, only deactivated | Legacy had no delete at all. The spec requires tutorial CRUD; deleting users would orphan authored tutorials and the report |
| Integer IDs retained | Matches legacy URLs (`?tid=`, `?cid=`) and keeps public URLs short |
| Audit log added | Modernization for accountability; shown as “Recent activity” on the dashboard |
| Description rendered as plain text | The legacy editor buttons never worked; plain text avoids an HTML sanitization surface |
| Profile: only name + e-mail required | Legacy required every field; forcing DOB/address/mobile adds no value and collects unnecessary personal data |

## 7. Acceptance-test inventory derived from the legacy workflows

| Legacy workflow | Automated coverage |
| --- | --- |
| Browse/filter/view tutorials | `e2e/public.spec.ts`, `apps/api/tests/integration/public-api.test.ts`, `apps/web/tests/catalog.test.tsx` |
| Login / logout / inactive account | `e2e/admin.spec.ts` (E2E-002), `auth-api.test.ts`, `auth.service.test.ts` |
| Add / edit tutorial (incl. Save & Add New) | E2E-003/004/005, `admin-api.test.ts`, `tutorial.facade.test.ts` |
| Category / difficulty management | E2E-007, `admin-api.test.ts`, `reference-data.service.test.ts` |
| User management (operators only, toggle status) | `e2e/admin.spec.ts`, `admin-api.test.ts`, `user.facade.test.ts` |
| Profile / change password | `admin-api.test.ts`, `user.facade.test.ts` |
| Tutorial report with date range | `e2e/admin.spec.ts`, `admin-api.test.ts`, `shared.test.ts` |
| Role boundary (operator ≠ admin) | E2E-006, `auth-api.test.ts`, `authorization.policy.test.ts` |
