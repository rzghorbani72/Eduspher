/**
 * Captures real AdminPanel + active template screenshots for the platform landing.
 *
 * Prerequisites: Backend :3000, AdminPanel :4000, edusphere :5000, demo-showcase seeded.
 *
 *   node scripts/capture-landing-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/landing');

const PANEL = process.env.PANEL_URL ?? 'http://localhost:4000';
const WEB = process.env.WEB_URL ?? 'http://localhost:5000';
const PHONE = process.env.DEMO_MANAGER_PHONE ?? '09000000100';
const PASSWORD = process.env.DEMO_MANAGER_PASSWORD ?? 'Demo1234!';

/** Active gallery templates only (کیهان، دستان، توان، پرستو، زبانه). */
const STUDENT_TEMPLATES = [
  'keyhan',
  'dastan',
  'tavan',
  'parastoo',
  'zabaneh'
];

/**
 * Manager/teacher panel pages used by the publish-section owner carousel.
 * Captured while logged into demo-showcase so shots show full sample data.
 */
const OWNER_PAGES = [
  ['/dashboard', 'hero-dashboard.png'],
  ['/courses', 'owner-courses.png'],
  ['/website/appearance', 'owner-appearance.png'],
  ['/analytics', 'owner-analytics.png'],
  // Full student payment rows (same data as /payments) — capture with demo login.
  ['/financial/academy', 'owner-financial.png']
];

/** Other landing slots that still need panel shots. */
const OTHER_PANEL_SHOTS = [
  ['/users', 'for-you-2.png'],
  ['/courses', 'admin-panel.png'],
  ['/settings', 'step-1.png'],
  ['/payments', 'step-3.png']
];

async function hideDevOverlay(page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      #webpack-dev-server-client-overlay { display: none !important; }
    `
  });
}

async function capture(page, url, filename, waitMs = 2500) {
  // Appearance polls live preview forever — networkidle never settles.
  const waitUntil = url.includes('/website/appearance') ? 'load' : 'networkidle';
  await page.goto(url, { waitUntil, timeout: 60_000 });
  await hideDevOverlay(page);
  await page.waitForTimeout(waitMs);
  await page.screenshot({
    path: path.join(OUT, filename),
    fullPage: false
  });
  console.log('saved', filename);
}

async function login(page) {
  await page.goto(`${PANEL}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="tel"]').fill(PHONE);
  await page.locator('form button:not([type="button"])').last().click();
  await page
    .locator('input[type="password"]')
    .waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('form button:not([type="button"])').last().click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20_000 });
}

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'fa-IR'
});
const page = await context.newPage();

try {
  await login(page);

  for (const [route, file] of OWNER_PAGES) {
    await capture(page, `${PANEL}${route}`, file, 3500);
  }

  for (const [route, file] of OTHER_PANEL_SHOTS) {
    await capture(page, `${PANEL}${route}`, file, 3000);
  }

  for (const id of STUDENT_TEMPLATES) {
    await capture(
      page,
      `${WEB}/preview/blocks?template=${id}&sample=1`,
      `template-${id}.png`,
      4000
    );
  }
} finally {
  await browser.close();
}

console.log('Done — screenshots written to public/landing/');
