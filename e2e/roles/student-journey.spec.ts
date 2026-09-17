import { test, expect, Page } from '@playwright/test';

/**
 * Student persona journey (@backend). A seeded student logs in and walks the
 * storefront: catalog → account/orders. The money path (real PayPing checkout)
 * is a deploy smoke, not automatable here; this proves the authenticated
 * student shell is navigable end to end without a broken screen.
 *
 * Run (see e2e/README.md): seed a student, then
 *   E2E_BACKEND=1 E2E_STUDENT_EMAIL=... E2E_STUDENT_PASSWORD=... E2E_ACADEMY_ID=<cuid> \
 *   pnpm test:e2e e2e/roles
 */
test.describe('edusphere student journey @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  async function login(page: Page, baseURL: string) {
    const email = process.env.E2E_STUDENT_EMAIL;
    const password = process.env.E2E_STUDENT_PASSWORD;
    const academyId = process.env.E2E_ACADEMY_ID;
    test.skip(!email || !password || !academyId, 'student creds + academy id required');

    await page
      .context()
      .addCookies([{ name: 'skillforge_selected_academy_id', value: academyId!, url: baseURL }]);
    await page.goto('/auth/login');
    await page.locator('#identifier').fill(email!);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#password')).toBeVisible({ timeout: 15_000 });
    await page.locator('#password').click();
    await page.locator('#password').pressSequentially(password!);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/account/, { timeout: 15_000 });
  }

  test('logs in, browses catalog, opens account/orders without a broken screen', async ({
    page,
    baseURL,
  }) => {
    await login(page, baseURL!);

    await page.goto('/courses');
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');

    // Order history is reachable now that we're authenticated (no bounce to login).
    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
