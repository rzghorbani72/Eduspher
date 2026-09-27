import { expect, test } from '@playwright/test';

import { JOURNEY, academyPath, loginSeededStudent } from '../helpers/journey';

// Needs a fresh `e2e:seed` run: it re-opens the quiz and the lesson-1 homework.
test.describe('@backend student journey: recorded course', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 and run the Backend e2e:seed first');

  test('opens the course, passes the quiz, and hands in homework', async ({ page }) => {
    await loginSeededStudent(page);

    await page.goto(academyPath('/account/courses'));
    await expect(page.getByRole('heading', { name: 'دوره ضبط‌شده آزمایشی' })).toBeVisible();
    await page.goto(academyPath(`/learn/${JOURNEY.offlineCourseSlug}`));
    await expect(page).toHaveURL(new RegExp(`/learn/${JOURNEY.offlineCourseSlug}/`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('tab', { name: 'آزمون' }).click();
    await page.getByRole('button', { name: 'شروع آزمون' }).click();
    await page.getByLabel('درست', { exact: true }).check();
    await page.getByRole('button', { name: 'ارسال آزمون' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('۱ / ۱');

    await page.getByRole('tab', { name: 'تکلیف' }).click();
    await page.getByLabel('پاسخ تکلیف').fill('پاسخ دانشجو در آزمون خودکار');
    await page.getByRole('button', { name: 'ارسال تکلیف' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('ارسال‌شده');

    await page.goto(academyPath('/account/assignments'));
    await expect(page.getByText('تکلیف درس اول')).toBeVisible();
  });
});
