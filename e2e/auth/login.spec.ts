import { test, expect } from '@playwright/test';

/**
 * edusphere `/auth/login` — STUDENT login (email or phone + password).
 * The form's zod messages are literal English strings, so we can assert them
 * directly regardless of the academy's display language.
 */
test.describe('edusphere student login — validation', () => {
  test('requires a password (email mode)', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('#identifier').fill('student@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('rejects a too-short password', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('#identifier').fill('student@example.com');
    await page.locator('#password').fill('123');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Minimum 6 characters')).toBeVisible();
  });
});

/**
 * Happy-path student login. Needs the API on :3000, a seeded STUDENT, and the
 * academy id resolvable by edusphere. Opt in with E2E_BACKEND=1.
 */
test.describe('edusphere student login — happy path @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test('logs in and lands on courses', async ({ page }) => {
    const email = process.env.E2E_STUDENT_EMAIL;
    const password = process.env.E2E_STUDENT_PASSWORD;
    test.skip(!email || !password, 'E2E_STUDENT_EMAIL/PASSWORD required');

    await page.goto('/auth/login');
    await page.locator('#identifier').fill(email!);
    await page.locator('#password').fill(password!);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/courses/, { timeout: 15_000 });
  });
});
