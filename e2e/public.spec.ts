import { expect, test } from '@playwright/test';

test.describe('E2E-001 public browsing', () => {
  test('home → catalogue → filter → detail → back, without signing in', async ({
    page,
    request,
  }) => {
    // Other specs add tutorials, so read the expected totals from the public API.
    const total = (await (await request.get('/api/v1/tutorials')).json()).pagination.totalItems;
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn at your own pace');
    await page.getByRole('link', { name: 'Explore tutorials' }).click();

    await expect(page).toHaveURL(/\/tutorials$/);
    await expect(page.getByText(`${total} tutorials available`)).toBeVisible();
    // Inactive content from the seed must never appear publicly.
    await expect(page.getByText('Code Review Checklist')).toHaveCount(0);

    await page.getByLabel('Category').selectOption({ label: 'Databases' });
    await expect(page).toHaveURL(/category=\d+/);
    const categoryId = new URL(page.url()).searchParams.get('category');
    const inCategory = (
      await (await request.get(`/api/v1/tutorials?categoryId=${categoryId}`)).json()
    ).pagination.totalItems;
    await expect(page.getByText(`${inCategory} tutorials match your filters`)).toBeVisible();

    await page.getByRole('link', { name: 'Preventing SQL Injection' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Preventing SQL Injection' }),
    ).toBeVisible();
    await expect(page.getByText('Writing SQL queries from application code')).toBeVisible();
    await expect(page).toHaveTitle('Preventing SQL Injection · MyTutor');

    await page.goBack();
    await expect(page).toHaveURL(/category=\d+/);
    await expect(page.getByLabel('Category')).toHaveValue(/\d+/);
    expect(errors).toEqual([]);
  });

  test('search, pagination and empty state', async ({ page }) => {
    await page.goto('/tutorials');
    await expect(page.getByRole('navigation', { name: 'Tutorial pages' })).toContainText(
      'Page 1 of 3',
    );
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/page=2/);

    await page.getByLabel('Search').fill('no-such-tutorial-xyz');
    await expect(page.getByRole('heading', { name: 'No tutorials found' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await expect(page.getByText(/^\d+ tutorials available$/)).toBeVisible();
  });

  test('unknown tutorials and pages show not-found states', async ({ page }) => {
    await page.goto('/tutorials/999999');
    await expect(page.getByRole('heading', { name: 'Tutorial not found' })).toBeVisible();
    await page.goto('/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});
