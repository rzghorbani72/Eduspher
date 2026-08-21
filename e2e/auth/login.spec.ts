import { test, expect } from '@playwright/test';

/**
 * edusphere `/auth/login` — STUDENT login, identifier-first: step 1 looks the
 * email/phone up, step 2 asks only for the method that account really has.
 */
test.describe('edusphere student login — step 1', () => {
  test('asks for the identifier only, never a password up front', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.locator('#identifier')).toBeVisible();
    await expect(page.locator('#password')).toHaveCount(0);
  });

  test('keeps continue disabled until the identifier is complete', async ({ page }) => {
    await page.goto('/auth/login');

    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeDisabled();

    await page.locator('#identifier').fill('half@');
    await expect(submit).toBeDisabled();

    await page.locator('#identifier').fill('someone@example.com');
    await expect(submit).toBeEnabled();

    // Still step 1 — no password box appears before the lookup.
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
    // selected-academy cookie to scope both the lookup and the login.
    await page.context().addCookies([
      {
        name: 'skillforge_selected_academy_id',
        value: academyId!,
        url: baseURL!,
      },
    ]);

    await page.goto('/auth/login');
    await page.locator('#identifier').fill(email!);
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#password')).toBeVisible({ timeout: 15_000 });
    await page.locator('#password').pressSequentially(password!);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/courses/, { timeout: 15_000 });
  });

  test('an unknown account is offered signup, not a password box', async ({ page, baseURL }) => {
    const academyId = process.env.E2E_ACADEMY_ID;
    test.skip(!academyId, 'E2E_ACADEMY_ID required');

    await page.context().addCookies([
      { name: 'skillforge_selected_academy_id', value: academyId!, url: baseURL! },
    ]);

    await page.goto('/auth/login');
    await page.locator('#identifier').fill('nobody-e2e@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('a[href*="/auth/register"]').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('#password')).toHaveCount(0);
  });
});
