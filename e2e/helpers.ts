import { expect, type Page } from '@playwright/test';
import { E2E_CREDENTIALS } from '../playwright.config';

export async function signIn(page: Page, who: keyof typeof E2E_CREDENTIALS = 'admin') {
  const { username, password } = E2E_CREDENTIALS[who];
  await page.goto('/login');
  await page.getByLabel('User ID').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

export const unique = (prefix: string) => `${prefix} ${Date.now().toString(36)}`;
