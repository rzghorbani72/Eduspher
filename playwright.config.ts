import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for edusphere (student storefront) auth flows.
 *
 * Note: edusphere is multi-tenant and resolves the academy on the server, so its
 * pages may call the API during SSR. Run the backend on :3000 for reliable runs.
 * `@backend`-tagged specs (happy-path) additionally need a seeded student and
 * opt in with `E2E_BACKEND=1`. See e2e/README.md.
 */
const PORT = 5000;
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    locale: 'fa-IR',
  },
  projects: [
    // Use the system-installed Google Chrome (`channel: 'chrome'`). Playwright's
    // bundled browsers don't install on every Linux version; set
    // PLAYWRIGHT_CHANNEL=chromium to use a downloaded browser where available.
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
      },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
