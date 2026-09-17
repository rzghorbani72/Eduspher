import { test, expect } from '@playwright/test';

/**
 * edusphere `/auth/register` — STUDENT sign-up. Step 1 verifies the academy's
 * primary channel (phone here) via OTP, step 2 collects the account details.
 */
test.describe('edusphere student register — validation', () => {
  test('checks the phone length first, then its format', async ({ page }) => {
    await page.goto('/auth/register');

    await expect(page.locator('input[name="display_name"]')).toHaveCount(0);
    await expect(page.getByText('نام نمایشی')).toHaveCount(0);
    await expect(page.getByPlaceholder(/0912\*\*\* \*\* \*\*|۰۹۱۲\*\*\* \*\* \*\*/)).toBeVisible();
    await expect(page.getByText('+98')).toHaveCount(0);

    const submit = page.locator('button[type="submit"]');
    const phone = page.locator('#phone_number');
    const invalid = page.getByText('شماره تلفن نامعتبر');

    await expect(submit).toBeDisabled();

    // Half-typed: not judged yet, so no error — just no way forward.
    await phone.fill('91200');
    await expect(invalid).toHaveCount(0);
    await expect(submit).toBeDisabled();

    // Full length but the wrong shape: now the format is judged.
    await phone.fill('1234567890');
    await expect(invalid).toBeVisible();
    await expect(submit).toBeDisabled();

    await phone.fill('9120001234');
    await expect(invalid).toHaveCount(0);
    await expect(submit).toBeEnabled();

    await phone.fill('09120001234');
    await expect(phone).toHaveValue('۰۹۱۲۰۰۰۱۲۳۴');
    await expect(submit).toBeEnabled();
  });
});
