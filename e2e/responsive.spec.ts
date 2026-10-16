import { expect, test } from '@playwright/test';

test.describe('E2E-008 responsive layout and reduced motion', () => {
  for (const width of [320, 390, 768, 1280]) {
    test(`no horizontal overflow and usable navigation at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ['/', '/tutorials', '/tutorials/1', '/login']) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
      await page.goto('/');
      if (width < 640) {
        await page.getByRole('button', { name: 'Open menu' }).click();
      }
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Tutorials' })
        .click();
      await expect(page).toHaveURL(/\/tutorials$/);
    });
  }

  test('reduced motion: nothing is hidden for animation and parallax is off', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(300);
    expect(await page.locator('[data-reveal="armed"]').count()).toBe(0);
    const transforms = await page
      .locator('[data-parallax-speed]')
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
    expect(transforms.every((t) => t === '')).toBe(true);
    await context.close();
  });

  test('motion allowed: off-screen cards reveal as they scroll into view', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/tutorials');
    await page.waitForLoadState('networkidle');
    const lastCard = page.locator('main li').last();
    await lastCard.scrollIntoViewIfNeeded();
    await expect(lastCard).not.toHaveAttribute('data-reveal', 'armed');
    await expect(lastCard).toBeVisible();
  });

  test('keyboard: skip link and focus reach main content', async ({ page }) => {
    await page.goto('/tutorials');
    await expect(page.getByRole('heading', { level: 1, name: 'Tutorials' })).toBeVisible();
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    // The next Tab continues from the main content, past the header navigation.
    await page.keyboard.press('Tab');
    await expect(page.locator('main :focus')).toHaveCount(1);
  });
});
