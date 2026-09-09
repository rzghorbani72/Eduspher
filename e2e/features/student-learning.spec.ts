import { expect, test } from "@playwright/test";

import { STUDENT_EMAIL, studentLogin } from "../helpers/auth";

test.describe("Student learning route — authentication", () => {
  test("redirects an anonymous learner to login", async ({ page }) => {
    await page.goto("/learn/course-slug/lesson-slug");

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page).toHaveURL(/redirect=/);
  });
});

test.describe("Student learning account tabs @backend", () => {
  test.skip(!process.env.E2E_BACKEND, "set E2E_BACKEND=1 to run against the API");
  test.skip(!STUDENT_EMAIL, "E2E_STUDENT_EMAIL required");

  test.beforeEach(async ({ page, baseURL }) => {
    await studentLogin(page, baseURL!);
  });

  for (const tab of ["progress", "work", "classes", "results", "tutoring"]) {
    test(`${tab} tab renders an honest state`, async ({ page }) => {
      await page.goto(`/account?tab=${tab}`);

      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});
