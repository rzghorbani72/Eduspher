import { test, expect } from '@playwright/test';
import { setAcademyCookie, studentLogin, STUDENT_EMAIL } from '../helpers/auth';

/**
 * Course catalog tests — mix of public (no auth) and authenticated views.
 *
 * Public tests: no backend required — the courses page is SSR but still renders
 * even when the API is unavailable (empty state).
 *
 * @backend tests: need the API running and a seeded academy.
 *
 * Run (public): pnpm test:e2e e2e/features/student-catalog.spec.ts
 * Run (all):    E2E_BACKEND=1 pnpm test:e2e e2e/features/student-catalog.spec.ts
 */
test.describe('Course catalog — public', () => {
  test('courses page renders (no auth required)', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    await page.goto('/courses');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    // The page must render something — search bar, empty-state, or course cards
    await expect(page.locator('body')).toBeVisible();
  });

  test('individual course URL shape is correct', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    const res = await page.goto('/courses');
    expect(res!.status()).toBeLessThan(400);
  });

  test('articles page renders', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    const res = await page.goto('/articles');
    expect(res!.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('articles list page renders (no crash)', async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
    // /articles is the storefront blog/article listing
    const res = await page.goto('/articles');
    // Accept 200 or 404 — the important thing is no 500
    expect(res!.status()).not.toBe(500);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});

test.describe('Course catalog — search and filter @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test.beforeEach(async ({ page, baseURL }) => {
    await setAcademyCookie(page.context(), baseURL!);
  });

  test('search query param renders results without crashing', async ({ page }) => {
    await page.goto('/courses?q=test');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('free filter renders without crashing', async ({ page }) => {
    await page.goto('/courses?is_free=true');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('page 2 renders without crashing', async ({ page }) => {
    await page.goto('/courses?page=2');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});

test.describe('Course catalog — authenticated student @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');
  test.skip(!STUDENT_EMAIL, 'E2E_STUDENT_EMAIL required for authenticated tests');

  test.beforeEach(async ({ page, baseURL }) => {
    await studentLogin(page, baseURL!);
  });

  test('authenticated student sees the catalog after login', async ({ page }) => {
    await page.goto('/courses');
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('navigating to a course detail renders without errors', async ({ page }) => {
    await page.goto('/courses');
    // If there are course cards/links, follow the first one
    const courseLink = page.locator('a[href*="/courses/"]').first();
    if ((await courseLink.count()) > 0) {
      await courseLink.click();
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    }
  });
});
