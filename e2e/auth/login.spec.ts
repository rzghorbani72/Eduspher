import { test, expect } from '@playwright/test';

/**
 * edusphere `/auth/login` — STUDENT login (email or phone + password).
 * The form's zod messages are literal English strings, so we can assert them
 * directly regardless of the academy's display language.
 */
test.describe('edusphere student login — validation', () => {
  test('requires an identifier (empty submit)', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Email or phone is required')).toBeVisible();
  });

  test('rejects a too-short password', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('#identifier').fill('student@example.com');
    await page.locator('#password').fill('123');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Minimum 6 characters')).toBeVisible();
  });

  test('OTP method removes the password field', async ({ page }) => {
    await page.goto('/auth/login');

    // Password is the default method.
    await expect(page.locator('#password')).toBeVisible();

    // Second button in the method toggle switches to one-time-code login.
    await page.locator('.bg-slate-100 button').nth(1).click();
    await expect(page.locator('#password')).toHaveCount(0);
  });
});

/**
 * Happy-path student login. Needs the API on :3000, a seeded STUDENT, and the
 * academy id resolvable by edusphere. Opt in with E2E_BACKEND=1.
 */
test.describe('edusphere student login — happy path @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test('logs in and lands on courses', async ({ page, baseURL }) => {
    const email = process.env.E2E_STUDENT_EMAIL;
    const password = process.env.E2E_STUDENT_PASSWORD;
    const academyId = process.env.E2E_ACADEMY_ID;
    test.skip(!email || !password, 'E2E_STUDENT_EMAIL/PASSWORD required');
    test.skip(!academyId, 'E2E_ACADEMY_ID required (the cuid the student belongs to)');

    // The student belongs to a specific academy; the login form reads the
    // selected-academy cookie to send academy_id to public login.
    await page.context().addCookies([
      {
        name: 'skillforge_selected_academy_id',
        value: academyId!,
        url: baseURL!,
      },
    ]);

    await page.goto('/auth/login');
    await page.locator('#identifier').fill(email!);
    // The password input is react-hook-form registered with a custom onChange
    // transform; type key-by-key so the value is captured reliably.
    await page.locator('#password').click();
    await page.locator('#password').pressSequentially(password!);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/courses/, { timeout: 15_000 });
  });
});
