import { Page, BrowserContext, expect } from '@playwright/test';

// The academy cookie name comes from NEXT_PUBLIC_ACADEMY_ID_COOKIE in env.local.
// Default falls back to the library default so tests work without the env set.
const ACADEMY_ID_COOKIE = process.env.NEXT_PUBLIC_ACADEMY_ID_COOKIE ?? 'eduspher_academy_id';

// The app uses NEXT_PUBLIC_DEFAULT_ACADEMY_ID=1 from env.local, so this cookie
// is only needed when the env default is not set or we want a specific academy.
export const ACADEMY_ID = process.env.E2E_ACADEMY_ID ?? '1';

export const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL ?? '';
export const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD ?? 'Passw0rd!';

export async function setAcademyCookie(context: BrowserContext, baseURL: string): Promise<void> {
  await context.addCookies([{ name: ACADEMY_ID_COOKIE, value: ACADEMY_ID, url: baseURL }]);
}

/**
 * Log in as a student. The academy ID is resolved by the app's env default
 * (NEXT_PUBLIC_DEFAULT_ACADEMY_ID=1) so no cookie is strictly required, but
 * we set it for explicitness and to match what the register flow produces.
 */
export async function studentLogin(
  page: Page,
  baseURL: string,
  email = STUDENT_EMAIL,
  password = STUDENT_PASSWORD,
): Promise<void> {
  await setAcademyCookie(page.context(), baseURL);
  await page.goto('/auth/login');
  // Identifier-first: the account is looked up before any password is asked for.
  await page.locator('#identifier').fill(email);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#password')).toBeVisible({ timeout: 20_000 });
  await page.locator('#password').click();
  await page.locator('#password').pressSequentially(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/account/, { timeout: 20_000 });
}
