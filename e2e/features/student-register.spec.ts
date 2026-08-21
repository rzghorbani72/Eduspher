import { test, expect } from '@playwright/test';
import { setAcademyCookie } from '../helpers/auth';

/**
 * Registration guards that need a resolvable academy. The full OTP flow lives
 * in e2e/auth/auth-flows.spec.ts.
 */
test.describe('Student registration — guards', () => {
  test('blocks registration with an incomplete phone', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    await page.goto('/auth/register');
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeDisabled();
    await page.locator('#phone_number').fill('91200');
    await expect(submit).toBeDisabled();
  });
});
