/**
 * Captures real AdminPanel + academy screenshots for the platform landing.
 *
 * Prerequisites: Backend :3000, AdminPanel :4000, edusphere :5000, demo-showcase seeded.
 *
 *   node scripts/capture-landing-screenshots.mjs
 *
 * Publish carousel uses matched student ↔ owner pairs (see landing.messages.ts).
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/landing');

const PANEL = process.env.PANEL_URL ?? 'http://localhost:4000';
const WEB = process.env.WEB_URL ?? 'http://localhost:5000';
const ACADEMY_WEB = process.env.ACADEMY_WEB_URL ?? 'http://demo-showcase.localhost:5000';
const PHONE = process.env.DEMO_MANAGER_PHONE ?? '09000000100';
const PASSWORD = process.env.DEMO_MANAGER_PASSWORD ?? 'Demo1234!';

/** Demo course ids from the local dev DB. Override via env. */
const COURSE_A = process.env.DEMO_COURSE_A_ID ?? 'cmt4hzhah002y48lbtu9iv7w4';
const COURSE_B = process.env.DEMO_COURSE_B_ID ?? 'cmt4hzhay003248lbtcpo4c7c';

/**
 * Matched pairs for the publish section (student URL → file, owner URL → file).
 * Keep this list in sync with LANDING.publish.pairs.
 */
const PUBLISH_CAPTURES = [
  {
    student: [`${ACADEMY_WEB}/courses/${COURSE_A}`, 'student-course.png'],
    owner: [`${PANEL}/courses`, 'owner-courses.png'],
  },
  {
    student: [`${WEB}/preview/blocks?template=parastoo&sample=1`, 'template-parastoo.png'],
    owner: [`${PANEL}/website/appearance`, 'owner-templates.png'],
  },
  {
    student: [`${ACADEMY_WEB}/courses/${COURSE_B}`, 'student-course-alt.png'],
    owner: [`${PANEL}/courses/${COURSE_A}`, 'owner-course-detail.png'],
  },
  {
    student: [`${WEB}/preview/blocks?template=keyhan&sample=1`, 'template-keyhan.png'],
    owner: [`${PANEL}/analytics`, 'owner-analytics-v2.png'],
  },
];

const OTHER_PANEL_SHOTS = [
  ['/users', 'for-you-2.png'],
  ['/courses', 'admin-panel.png'],
  ['/financial/academy', 'owner-financial-v2.png'],
  ['/dashboard', 'hero-dashboard.png'],
];

async function hideDevOverlay(page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      #webpack-dev-server-client-overlay { display: none !important; }
    `,
  });
}

async function capture(page, url, filename, waitMs = 2500) {
  const waitUntil = url.includes('/website/appearance') ? 'load' : 'networkidle';
  await page.goto(url, { waitUntil, timeout: 60_000 });
  await hideDevOverlay(page);
  await page.waitForTimeout(waitMs);
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: path.join(OUT, filename),
    fullPage: false,
  });
  console.log('saved', filename);
}

async function login(page) {
  await page.goto(`${PANEL}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="tel"]').fill(PHONE);
  await page.locator('form button:not([type="button"])').last().click();
  await page.locator('input[type="password"]').waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('form button:not([type="button"])').last().click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20_000 });
}

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'fa-IR',
});
const page = await context.newPage();

try {
  for (const pair of PUBLISH_CAPTURES) {
    await capture(page, pair.student[0], pair.student[1], 4000);
  }

  await login(page);

  for (const pair of PUBLISH_CAPTURES) {
    await capture(page, pair.owner[0], pair.owner[1], 4000);
  }

  for (const [route, file] of OTHER_PANEL_SHOTS) {
    await capture(page, `${PANEL}${route}`, file, 3000);
  }
} finally {
  await browser.close();
}

console.log('Done — screenshots written to public/landing/');
