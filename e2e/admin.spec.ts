import { expect, test } from '@playwright/test';
import { signIn, unique } from './helpers';

test.describe('E2E-002 administrator login', () => {
  test('signs in, lands on the dashboard, and /auth/me returns the principal', async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Welcome, Site Administrator' })).toBeVisible();
    const me = await page.request.get('/api/v1/auth/me');
    expect(me.status()).toBe(200);
    expect((await me.json()).data.user).toMatchObject({ username: 'admin', role: 'ADMIN' });

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.request.get('/api/v1/auth/me')).status()).toBe(401);
  });

  test('rejects bad credentials without revealing which part was wrong', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('User ID').fill('admin');
    await page.getByLabel('Password').fill('definitely-wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toHaveText('Invalid username or password.');
  });
});

test.describe('tutorial management', () => {
  test('E2E-003/004 create, publish, update and delete a tutorial', async ({ page }) => {
    const title = unique('E2E Tutorial');
    await signIn(page);
    await page.getByRole('link', { name: 'New tutorial' }).click();
    await page.getByLabel('Tutorial title').fill(title);
    await page.getByLabel('Category').selectOption({ label: 'Web Development' });
    await page.getByLabel('Difficulty level').selectOption({ label: 'Beginner' });
    await page.getByLabel('Prerequisites').fill('A web browser');
    await page.getByLabel('Description').fill('First paragraph.\n\nSecond paragraph.');
    await page.getByRole('button', { name: 'Create tutorial' }).click();

    await expect(page).toHaveURL(/\/admin\/tutorials$/);
    await expect(page.getByText(`Created “${title}”.`)).toBeVisible();
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();

    // Published → visible publicly.
    await page.goto('/tutorials?search=' + encodeURIComponent(title));
    await page.getByRole('link', { name: title, exact: true }).click();
    await expect(page.getByText('Second paragraph.')).toBeVisible();
    const publicUrl = page.url();

    // Update: rename and unpublish.
    await page.goto('/admin/tutorials?search=' + encodeURIComponent(title));
    await page.getByRole('link', { name: title, exact: true }).click();
    await page.getByLabel('Tutorial title').fill(`${title} v2`);
    await page.getByLabel('Inactive — hidden').check();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Tutorial updated.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: `${title} v2`, exact: true })).toBeVisible();

    await page.goto(publicUrl);
    await expect(page.getByRole('heading', { name: 'Tutorial not found' })).toBeVisible();

    // Delete with confirmation.
    await page.goto('/admin/tutorials?search=' + encodeURIComponent(`${title} v2`));
    await page.getByRole('button', { name: `Delete ${title} v2` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete tutorial' }).click();
    await expect(page.getByText(`Deleted “${title} v2”.`)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'No tutorials match these filters' }),
    ).toBeVisible();
  });

  test('E2E-005 invalid data shows field errors and is not persisted', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/tutorials/new');
    await page.getByRole('button', { name: 'Create tutorial' }).click();
    await expect(page.getByText('Title is required.')).toBeVisible();
    await expect(page.getByText('Choose a category.')).toBeVisible();
    await expect(page.getByText('Description is required.')).toBeVisible();
    await expect(page.getByLabel('Tutorial title')).toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/admin\/tutorials\/new$/);

    // Server-side validation is authoritative even if the UI is bypassed.
    const session = await (await page.request.get('/api/v1/auth/session')).json();
    const res = await page.request.post('/api/v1/admin/tutorials', {
      headers: { 'x-csrf-token': session.data.csrfToken },
      data: { title: 'x', description: 'y', categoryId: 999999, difficultyLevelId: 999999 },
    });
    expect(res.status()).toBe(422);
  });

  test('warns before discarding unsaved edits', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/tutorials/new');
    await page.getByLabel('Tutorial title').fill('Half-written');
    await page.getByRole('link', { name: 'Categories' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Discard unsaved changes?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByLabel('Tutorial title')).toHaveValue('Half-written');
  });
});

test.describe('E2E-006 unauthorized access', () => {
  test('redirects anonymous users and the API rejects direct calls', async ({ page, request }) => {
    await page.goto('/admin/tutorials');
    await expect(page).toHaveURL(/\/login$/);
    expect((await request.get('/api/v1/admin/tutorials')).status()).toBe(401);
    expect(
      (await request.post('/api/v1/admin/categories', { data: { title: 'x' } })).status(),
    ).toBe(401);
  });

  test('operators cannot manage users, in the UI or via the API', async ({ page }) => {
    await signIn(page, 'operator');
    await expect(
      page.getByRole('navigation', { name: 'Administration' }).getByRole('link', { name: 'Users' }),
    ).toHaveCount(0);
    await page.goto('/admin/users');
    await expect(
      page.getByRole('heading', { name: 'You don’t have access to this page' }),
    ).toBeVisible();
    expect((await page.request.get('/api/v1/admin/users')).status()).toBe(403);
  });
});

test.describe('E2E-007 reference data', () => {
  test('create a category, use it on a tutorial, and deletion is prevented', async ({ page }) => {
    const category = unique('E2E Category');
    const title = unique('Uses category');
    await signIn(page);

    await page.goto('/admin/categories');
    await page.getByRole('button', { name: 'New category' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Title').fill(category);
    await dialog.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText(`Created category “${category}”.`)).toBeVisible();

    await page.goto('/admin/tutorials/new');
    await page.getByLabel('Tutorial title').fill(title);
    await page.getByLabel('Category').selectOption({ label: category });
    await page.getByLabel('Difficulty level').selectOption({ label: 'Beginner' });
    await page.getByLabel('Description').fill('Body');
    await page.getByRole('button', { name: 'Create tutorial' }).click();
    await expect(page.getByText(`Created “${title}”.`)).toBeVisible();

    await page.goto('/tutorials');
    await page.getByLabel('Category').selectOption({ label: category });
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();

    await page.goto('/admin/categories?search=' + encodeURIComponent(category));
    await page.getByRole('button', { name: `Delete ${category}` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(/is used by 1 tutorial/).last()).toBeVisible();
    await page.reload();
    await expect(page.getByText(category)).toBeVisible();
  });
});

test.describe('users, account and reports', () => {
  test('admin creates an operator who can sign in; deactivation blocks them', async ({
    page,
    browser,
  }) => {
    const username = `op${Date.now().toString(36)}`;
    await signIn(page);
    await page.goto('/admin/users/new');
    await page.getByLabel('User ID').fill(username);
    await page.getByLabel(/^Password/).fill('operator-pass-9');
    await page.getByLabel('Confirm password').fill('operator-pass-9');
    await page.getByLabel('Full name').fill('Temp Operator');
    await page.getByLabel('Email').fill(`${username}@example.org`);
    await page.getByRole('button', { name: 'Create operator' }).click();
    await expect(page.getByText(`Created operator “${username}”.`)).toBeVisible();

    const other = await browser.newContext();
    const opPage = await other.newPage();
    await opPage.goto('/login');
    await opPage.getByLabel('User ID').fill(username);
    await opPage.getByLabel('Password').fill('operator-pass-9');
    await opPage.getByRole('button', { name: 'Sign in' }).click();
    await expect(opPage).toHaveURL(/\/admin$/);

    await page.goto('/admin/users?search=Temp');
    await page.getByRole('button', { name: 'Deactivate Temp Operator' }).click();
    await expect(page.getByText('Temp Operator is now inactive.')).toBeVisible();

    await opPage.goto('/admin/tutorials');
    await expect(opPage).toHaveURL(/\/login$/);
    await other.close();
  });

  test('tutorial report filters by date range', async ({ page }) => {
    await signIn(page, 'operator');
    await page.goto('/admin/reports');
    await page.getByLabel('From').fill('2026-09-01');
    await page.getByLabel('To').fill('2026-09-30');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page).toHaveURL(/from=2026-09-01&to=2026-09-30/);
    await expect(
      page.getByText(/^4 tutorials created from 2026-09-01 to 2026-09-30/),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Code Review Checklist' })).toBeVisible();
  });
});
