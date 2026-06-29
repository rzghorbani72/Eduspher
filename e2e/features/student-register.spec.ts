import { test, expect } from '@playwright/test';
import { ACADEMY_ID, setAcademyCookie } from '../helpers/auth';

/**
 * Full student registration flow @backend.
 *
 * Step 1 — phone OTP: fill phone → request OTP → enter code → verify.
 * Step 2 — account form: fill name / display_name / password → submit.
 *
 * The dev backend returns the OTP code in the response body so it can be
 * read from the page. In production the code goes to SMS only; this test
 * therefore only runs in dev/staging environments.
 *
 * Run: E2E_BACKEND=1 E2E_ACADEMY_ID=<cuid> pnpm test:e2e e2e/features/student-register.spec.ts
 */
test.describe('Student registration — full OTP flow @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test('registers a new student via phone OTP and reaches login', async ({
    page,
    baseURL
  }) => {
    // Set academy cookie so the register form sends the correct academy_id.
    // Falls back to NEXT_PUBLIC_DEFAULT_ACADEMY_ID=1 from env.local if omitted.
    await setAcademyCookie(page.context(), baseURL!);

    // Generate a unique mobile number so this account doesn't already exist.
    const phone = '9' + String(Date.now()).slice(-9);

    await page.goto('/auth/register');

    // ── Step 1: phone verification ──────────────────────────────────────
    await page.locator('#phone_number').fill(phone);
    await page.getByRole('button', { name: /Send.*OTP|ارسال کد/i }).click();

    // Dev backend prints "Code: XXXXXX" on the page (never in production).
    const codeText = await page
      .getByText(/Code:/i)
      .innerText({ timeout: 20_000 });
    const otp = codeText.match(/Code:\s*(\d{4,6})/)?.[1];
    expect(otp, 'OTP code must appear on the page in dev mode').toBeTruthy();

    await page.locator('#phoneOtp').fill(otp!);
    await page.getByRole('button', { name: /Verify.*OTP|تأیید کد/i }).click();
    await expect(page.getByText(/Phone verified|تأیید شد/i)).toBeVisible({
      timeout: 15_000
    });

    // Proceed to account-details form.
    await page.locator('button[type="submit"]').click();

    // ── Step 2: account details ──────────────────────────────────────────
    const timestamp = Date.now();
    await page.locator('#name').fill(`E2E Student ${timestamp}`);
    await page.locator('#display_name').fill(`E2E ${timestamp}`);
    await page.locator('#password').fill('Passw0rd!');
    await page.locator('#confirmed_password').fill('Passw0rd!');
    await page.getByRole('button', { name: /^Register$|^ثبت‌نام$/ }).click();

    // Success message or redirect to login.
    await expect(
      page.getByText(/Registration successful|موفق/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('blocks registration with an empty phone', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    await page.goto('/auth/register');
    await page.locator('button[type="submit"]').click();
    await expect(
      page.getByText(/valid phone|شماره/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
