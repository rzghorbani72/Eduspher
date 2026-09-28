import { expect, test, type Locator } from '@playwright/test';

import { JOURNEY, academyPath, loginSeededStudent } from '../helpers/journey';

const RIGHT = 'پاسخ درست';
const WRONG = 'پاسخ نادرست';

/** Pick the same answer for every drawn question, then submit. */
async function answerAll(panel: Locator, answer: string) {
  await expect(panel.getByLabel(answer, { exact: true }).first()).toBeVisible();
  for (const option of await panel.getByLabel(answer, { exact: true }).all()) {
    await option.check();
  }
  await panel.getByRole('button', { name: 'ارسال آزمون' }).click();
}

// Needs a fresh `e2e:seed` run: it wipes this student's attempts and certificate.
test.describe('@backend student journey: quiz gates and certificate', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 and run the Backend e2e:seed first');

  test('fails, retries and passes the gate, then earns the certificate', async ({ page }) => {
    await loginSeededStudent(page, JOURNEY.quizStudentPhone);
    await page.goto(academyPath(`/learn/${JOURNEY.quizCourseSlug}`));
    const rail = page.getByTestId('learning-curriculum-rail');
    await expect(rail).toContainText('«آزمون درس اول» قبول شوید');

    await page.getByRole('tab', { name: 'آزمون' }).click();
    await page.getByRole('button', { name: 'شروع آزمون' }).click();
    await answerAll(page.getByRole('tabpanel'), WRONG);
    await expect(page.getByRole('tabpanel')).toContainText('قبول نشده');

    await page.getByRole('button', { name: 'شرکت دوباره' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('فرصت باقی‌مانده');
    await page.getByRole('button', { name: 'شرکت دوباره' }).click();
    await answerAll(page.getByRole('tabpanel'), RIGHT);
    await expect(rail).not.toContainText('«آزمون درس اول» قبول شوید');

    await page.goto(academyPath(`/learn/${JOURNEY.quizCourseSlug}/${JOURNEY.quizLessonTwoSlug}`));
    await page.getByRole('button', { name: 'تکمیل شد، درس بعد' }).click();
    await expect(page).toHaveURL(new RegExp(JOURNEY.quizLessonThreeSlug));
    await page.getByRole('button', { name: 'علامت‌گذاری به‌عنوان تکمیل‌شده' }).click();

    // The final exam belongs to the course, not to a lesson: it opens in a dialog.
    await rail.getByRole('button', { name: /آزمون پایانی دوره/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'شروع آزمون' }).click();
    await answerAll(dialog, RIGHT);
    await expect(dialog.getByRole('link', { name: /گواهی شما صادر شد/ })).toBeVisible();

    await page.goto(academyPath('/account/certificates'));
    await expect(page.getByText('دوره آزمون‌دار آزمایشی')).toBeVisible();
  });
});
