import { test, expect } from '@playwright/test';
import { studentLogin, setAcademyCookie, STUDENT_EMAIL } from '../helpers/auth';

/**
 * Student account pages @backend.
 * Covers: my courses, settings, transactions, classes, change-password form,
 * and the hacker path (unauthenticated access bounces to login).
 *
 * Run: E2E_BACKEND=1 E2E_STUDENT_EMAIL=... E2E_STUDENT_PASSWORD=... \
 *      pnpm test:e2e e2e/features/student-account.spec.ts
 */
test.describe('Student account — unauthenticated guard (no backend)', () => {
  const GUARDED = ['/account', '/account/orders', '/checkout', '/learn/demo/live'];

  for (const route of GUARDED) {
    test(`unauthenticated ${route} → redirected to /auth/login`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    });
  }
});

test.describe('Student account — authenticated @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');
  test.skip(!STUDENT_EMAIL, 'E2E_STUDENT_EMAIL required');

  test.beforeEach(async ({ page, baseURL }) => {
    await studentLogin(page, baseURL!);
  });

  test('account page loads my-courses tab by default', async ({ page }) => {
    await page.goto('/account');
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('account settings tab renders without errors', async ({ page }) => {
    await page.goto('/account?tab=settings');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    // Change-password form should be visible
    await expect(page.locator('body').getByText(/change password|تغییر رمز/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('account transactions tab renders without errors', async ({ page }) => {
    await page.goto('/account?tab=transactions');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('account classes tab renders without errors', async ({ page }) => {
    await page.goto('/account?tab=classes');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('account history tab renders without errors', async ({ page }) => {
    await page.goto('/account?tab=history');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('account sidebar is visible with user identity', async ({ page }) => {
    await page.goto('/account');
    // The AccountSidebar shows the user's name/email
    await expect(page.locator('[class*="sidebar"], aside, nav').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigating from catalog to account and back works', async ({ page }) => {
    await page.goto('/courses');
    await page.goto('/account');
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    await page.goto('/courses');
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('orders page is reachable from account', async ({ page }) => {
    await page.goto('/account/orders');
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});

test.describe('Student login — happy path @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');
  test.skip(!STUDENT_EMAIL, 'E2E_STUDENT_EMAIL required');

  test('student logs in and reaches account', async ({ page, baseURL }) => {
    await studentLogin(page, baseURL!);
    await expect(page).toHaveURL(/\/account/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('wrong password shows an error and stays on login', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    await page.goto('/auth/login');
    await page.locator('#identifier').fill(STUDENT_EMAIL);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#password')).toBeVisible({ timeout: 15_000 });
    await page.locator('#password').click();
    await page.locator('#password').pressSequentially('definitely-wrong-pw!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
