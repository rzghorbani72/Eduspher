import { test, expect } from '@playwright/test';

/**
 * Smoke: the unauthenticated storefront auth pages render without a backend and
 * an unknown route shows the 404 page (not a blank/500). These prove the public
 * shell is intact before any API-dependent journey runs.
 */
test.describe('edusphere public pages (smoke)', () => {
  test('login page renders identifier + password + submit', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('#identifier')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register page renders a submit button', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('forgot-password page renders its identifier step', async ({ page }) => {
    const res = await page.goto('/auth/forgot-password');
    expect(res!.status()).toBeLessThan(400);
    await expect(page.locator('#identifier')).toBeVisible();
  });

  test('unknown route under /auth renders the 404 page, not a crash', async ({ page }) => {
    // A top-level unknown path is caught by the `[slug]` academy route, so target
    // a path under a real segment (/auth) that has no such child → real 404.
    const res = await page.goto('/auth/this-route-does-not-exist-xyz');
    expect(res!.status()).toBe(404);
    // not-found.tsx renders human content, never a raw stack trace.
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('html document is in Persian RTL by default', async ({ page }) => {
    await page.goto('/auth/login');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'fa');
  });
});
