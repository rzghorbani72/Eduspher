import { expect, test } from '@playwright/test';

import { installFakeJitsi } from '../helpers/fake-jitsi';
import { JOURNEY, academyPath, loginSeededStudent } from '../helpers/journey';

// The seed puts a class meeting inside its join window, so the room opens at once.
test.describe('@backend student journey: live class', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 and run the Backend e2e:seed first');

  test('joins the class room once and talks in the class chat', async ({ page }) => {
    await installFakeJitsi(page);
    await loginSeededStudent(page, JOURNEY.liveStudentPhone);

    await page.goto(academyPath('/account/classes'));
    await expect(page.getByText('کلاس آزمایشی')).toBeVisible();
    await page.goto(academyPath(`/learn/${JOURNEY.liveCourseSlug}/live`));

    await expect(page.locator('[data-meet-phase="inCall"]')).toBeVisible({ timeout: 20_000 });
    const room = await page.evaluate(
      () => (window as Window & { __jitsiLastRoom?: string }).__jitsiLastRoom,
    );
    expect(room).toBe(`${JOURNEY.academySlug}-room`);

    await page.getByRole('tab', { name: 'گفتگوی کلاس' }).click();
    const message = `سلام کلاس ${Date.now()}`;
    const box = page.getByTestId('discussion-thread').locator('textarea');
    await box.fill(message);
    await box.press('Enter');
    await expect(page.getByTestId('discussion-thread')).toContainText(message);
  });
});
