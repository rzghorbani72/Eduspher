import { test, expect, type Page } from '@playwright/test';

/**
 * The three auth buttons, end to end against the real API: register, login,
 * forgot password. Verified against a dev backend, which returns the OTP in the
 * response so the page can show it — in production the code is SMS-only, so
 * this suite is dev/staging material.
 *
 * Run: E2E_BACKEND=1 E2E_ACADEMY_ID=<cuid> pnpm exec playwright test e2e/auth/auth-flows.spec.ts
 */
const PASSWORD = 'Passw0rd!x';
const NEW_PASSWORD = 'Newpass1!';

const toEnglishDigits = (value: string) =>
  value.replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/** The dev backend echoes the code into the "code sent" toast. */
async function readOtp(page: Page) {
  const toast = await page
    .getByText(/کد:|Code:/)
    .last()
    .innerText({ timeout: 15_000 });
  const code = toEnglishDigits(toast).match(/(\d{4,6})/)?.[1];
  expect(code, 'the dev backend should show the code').toBeTruthy();
  return code!;
}

async function fillOtp(page: Page, code: string) {
  const boxes = page.locator('.auth-otp input');
  for (let i = 0; i < code.length; i++) {
    await boxes.nth(i).fill(code[i]);
  }
}

test.describe('edusphere auth flows @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test('registers, logs in, then resets the password', async ({ page, baseURL }) => {
    const academyId = process.env.E2E_ACADEMY_ID;
    test.skip(!academyId, 'E2E_ACADEMY_ID required (the cuid the student joins)');

    // Fresh national mobile number, so the account cannot already exist.
    const phone = '9' + String(Date.now()).slice(-9);
    await page.context().addCookies([
      { name: 'skillforge_selected_academy_id', value: academyId!, url: baseURL! },
    ]);

    // ── Register: one button walks send → verify → continue ──────────────
    await page.goto('/auth/register');
    await page.locator('#phone_number').fill(phone);
    await page.locator('button[type="submit"]').click();
    await fillOtp(page, await readOtp(page));
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 15_000 });
    await page.locator('input[name="name"]').fill('E2E Student');
    await page.locator('input[name="display_name"]').fill('E2E');
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="confirmed_password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await expect(page.getByText(/موفق|success/i).first()).toBeVisible({ timeout: 20_000 });

    // ── Login: identifier first, then the method that account really has ──
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /تلفن|phone/i }).first().click();
    await page.locator('#identifier').fill(phone);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#password')).toBeVisible({ timeout: 15_000 });
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 20_000 });

    // ── Forgot password: validate → code → new password ───────────────────
    await page.goto('/auth/forgot-password');
    await page.getByRole('button', { name: /^تلفن$|^phone$/i }).first().click();
    await page.locator('#identifier').fill(phone);
    await page.locator('.auth-submit-btn').first().click(); // validate the account
    await expect(page.getByText(/حساب|account/i).first()).toBeVisible({ timeout: 15_000 });
    await page.locator('.auth-submit-btn').first().click(); // send the code
    await fillOtp(page, await readOtp(page));
    await page.locator('.auth-submit-btn').first().click(); // verify the code

    await expect(page.locator('#password')).toBeVisible({ timeout: 15_000 });
    await page.locator('#password').fill(NEW_PASSWORD);
    await page.locator('#confirmed_password').fill(NEW_PASSWORD);
    await page.locator('.auth-submit-btn').first().click();
    await expect(page.getByText(/موفق|success/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
