import { test, expect } from '@playwright/test';

/**
 * edusphere `/auth/register` — STUDENT sign-up. Step 1 verifies the academy's
 * primary channel (phone here) via OTP, step 2 collects the account details.
 */
test.describe('edusphere student register — validation', () => {
  test('asks for a valid phone before sending an OTP', async ({ page }) => {
    await page.goto('/auth/register');

    // "Continue to Form" with an empty phone triggers a client-side guard.
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText('Please enter a valid phone number first'),
    ).toBeVisible();
  });
});

/**
 * Happy-path: phone OTP → details → account created. Needs the API + a resolvable
 * academy. Opt in with E2E_BACKEND=1. Creates a throwaway user (unique phone),
 * so run against a disposable DB in CI.
 */
test.describe('edusphere student register — happy path @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test('registers via phone OTP and reaches login', async ({ page, baseURL }) => {
    const academyId = process.env.E2E_ACADEMY_ID;
    test.skip(!academyId, 'E2E_ACADEMY_ID required (the cuid the student joins)');

    // Fresh national mobile number so the account does not already exist.
    const phone = '9' + String(Date.now()).slice(-9);

    await page.context().addCookies([
      { name: 'skillforge_selected_academy_id', value: academyId!, url: baseURL! },
    ]);
    await page.goto('/auth/register');

    // Step 1 — phone + OTP (the dev backend returns the code on screen).
    await page.locator('#phone_number').fill(phone);
    await page.getByRole('button', { name: /Send Phone OTP/i }).click();

    const codeText = await page
      .getByText(/Code:/i)
      .innerText({ timeout: 15_000 });
    const code = codeText.match(/Code:\s*(\d{4,6})/)?.[1];
    expect(code, 'OTP code should be shown in dev mode').toBeTruthy();

    await page.locator('#phoneOtp').fill(code!);
    await page.getByRole('button', { name: /Verify Phone OTP/i }).click();
    await expect(page.getByText('Phone verified successfully')).toBeVisible({
      timeout: 15_000,
    });

    await page.locator('button[type="submit"]').click(); // Continue to Form

    // Step 2 — account details.
    await page.locator('#name').fill('E2E UI Student');
    await page.locator('#display_name').fill('E2E UI Student');
    await page.locator('#password').fill('Passw0rd!');
    await page.locator('#confirmed_password').fill('Passw0rd!');
    await page.getByRole('button', { name: /^Register$/ }).click();

    // Success banner then redirect to login.
    await expect(page.getByText(/Registration successful/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
