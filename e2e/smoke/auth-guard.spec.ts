import { test, expect } from '@playwright/test';

/**
 * Hacker / unauthenticated-access smoke (no backend): a student-only area hit
 * directly by URL bounces to /auth/login (preserving a ?redirect= back), never
 * rendering the account/checkout shell.
 */
const PROTECTED = ['/account', '/account/orders', '/checkout', '/learn/demo/live'];

test.describe('edusphere auth guard (smoke)', () => {
  for (const route of PROTECTED) {
    test(`unauthenticated ${route} → redirected to /auth/login`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });
  }
});
