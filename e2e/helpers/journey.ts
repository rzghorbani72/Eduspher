import { expect, test, type Page } from '@playwright/test';

/**
 * Values printed by `pnpm --dir ../Backend e2e:seed`. The site picks the academy
 * from the URL path, so every journey page lives under `/<academy slug>/…`.
 */
export const JOURNEY = {
  academyId: process.env.E2E_ACADEMY_ID ?? '',
  academySlug: process.env.E2E_ACADEMY_SLUG ?? 'e2e-journeys',
  studentPhone: process.env.E2E_STUDENT_EMAIL ?? '',
  liveStudentPhone: process.env.E2E_LIVE_STUDENT_PHONE ?? '',
  password: process.env.E2E_STUDENT_PASSWORD ?? 'Passw0rd!',
  offlineCourseSlug: process.env.E2E_OFFLINE_COURSE_SLUG ?? 'e2e-journeys-offline',
  liveCourseSlug: process.env.E2E_LIVE_COURSE_SLUG ?? 'e2e-journeys-live',
  quizStudentPhone: process.env.E2E_QUIZ_STUDENT_PHONE ?? '',
  quizCourseSlug: process.env.E2E_QUIZ_COURSE_SLUG ?? 'e2e-journeys-quiz',
  quizLessonTwoSlug: process.env.E2E_QUIZ_LESSON_TWO_SLUG ?? 'e2e-journeys-quiz-2',
  quizLessonThreeSlug: process.env.E2E_QUIZ_LESSON_THREE_SLUG ?? 'e2e-journeys-quiz-3',
} as const;

export const academyPath = (path: string): string => `/${JOURNEY.academySlug}${path}`;

export async function loginSeededStudent(
  page: Page,
  phone: string = JOURNEY.studentPhone,
): Promise<void> {
  // A fresh browser has no academy cookie yet; without it the first page may
  // resolve another academy and offer an SMS code instead of the password.
  const url = test.info().project.use.baseURL ?? 'http://localhost:5000';
  await page.context().addCookies([
    { name: 'academy_id', value: JOURNEY.academyId, url },
    { name: 'academy_slug', value: JOURNEY.academySlug, url },
  ]);
  await page.goto(academyPath('/auth/login'));
  await page.locator('#identifier').fill(phone);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#password')).toBeVisible({ timeout: 20_000 });
  await page.locator('#password').pressSequentially(JOURNEY.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/account/, { timeout: 20_000 });
}
