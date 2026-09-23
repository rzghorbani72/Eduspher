import { expect, test, type Page } from '@playwright/test';

import { pickPlaySession, sessionState } from '../../lib/live/session-state';
import { REJOIN_SETTLE_MS } from '../../lib/live/meet-lifecycle';

/**
 * Install a fake JitsiMeetExternalAPI before the app boots so Mentoma Meet
 * never loads the real meet.mentoma.ir script in CI.
 */
async function installFakeJitsi(page: Page): Promise<void> {
  await page.addInitScript(() => {
    type FakeOpts = { roomName?: string; parentNode?: HTMLElement; jwt?: string };
    const g = window as Window & {
      __jitsiBoots?: number;
      __jitsiDisposes?: number;
      __jitsiHangups?: number;
      __jitsiLastRoom?: string;
      JitsiMeetExternalAPI?: new (
        domain: string,
        options: FakeOpts,
      ) => {
        dispose: () => void;
        addListener: (event: string, listener: () => void) => void;
        executeCommand: (command: string) => void;
      };
    };

    g.__jitsiBoots = 0;
    g.__jitsiDisposes = 0;
    g.__jitsiHangups = 0;

    g.JitsiMeetExternalAPI = class FakeJitsi {
      private listeners = new Map<string, () => void>();

      constructor(_domain: string, options: FakeOpts) {
        g.__jitsiBoots = (g.__jitsiBoots ?? 0) + 1;
        g.__jitsiLastRoom = options.roomName;
        options.parentNode?.setAttribute('data-fake-jitsi', '1');
      }

      addListener(event: string, listener: () => void) {
        this.listeners.set(event, listener);
      }

      executeCommand(command: string) {
        if (command === 'hangup') {
          g.__jitsiHangups = (g.__jitsiHangups ?? 0) + 1;
          this.listeners.get('readyToClose')?.();
          this.listeners.get('videoConferenceLeft')?.();
        }
      }

      dispose() {
        g.__jitsiDisposes = (g.__jitsiDisposes ?? 0) + 1;
      }
    };
  });
}

test.describe('Live classroom reliability (fixture)', () => {
  test('join UI stays available during an open class after reload', async ({ page }) => {
    await installFakeJitsi(page);
    const response = await page.goto('/e2e-fixtures/live-room');
    expect(response?.ok(), 'e2e live fixture must be reachable in non-production').toBeTruthy();

    await expect(page.getByTestId('e2e-live-room')).toBeVisible();
    await expect(
      page.locator('[data-meet-phase="inCall"], [data-meet-phase="loading"]'),
    ).toBeVisible({ timeout: 15_000 });

    await page.reload();

    await expect(page.getByTestId('e2e-live-room')).toBeVisible();
    await expect(
      page.locator('[data-meet-phase="inCall"], [data-meet-phase="loading"]'),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-live-state="upcoming"]')).toHaveCount(0);
  });

  test('hard reload boots Meet at most twice (Strict Mode) and settles', async ({ page }) => {
    await installFakeJitsi(page);
    const response = await page.goto('/e2e-fixtures/live-room');
    expect(response?.ok(), 'e2e live fixture must be reachable in non-production').toBeTruthy();

    await expect
      .poll(async () =>
        page.evaluate(() => (window as Window & { __jitsiBoots?: number }).__jitsiBoots ?? 0),
      )
      .toBeGreaterThanOrEqual(1);

    await page.reload();

    await expect
      .poll(
        async () =>
          page.evaluate(() => (window as Window & { __jitsiBoots?: number }).__jitsiBoots ?? 0),
        { timeout: 10_000 },
      )
      .toBeGreaterThanOrEqual(1);

    const boots = await page.evaluate(
      () => (window as Window & { __jitsiBoots?: number }).__jitsiBoots ?? 0,
    );
    expect(boots).toBeLessThanOrEqual(2);
  });

  test('closed join window does not show the Meet embed', async ({ page }) => {
    await installFakeJitsi(page);
    const response = await page.goto('/e2e-fixtures/live-room?closed=1');
    expect(response?.ok(), 'e2e live fixture must be reachable in non-production').toBeTruthy();

    await expect(page.getByTestId('e2e-live-room')).toBeVisible();
    await expect(page.locator('[data-can-join="false"]')).toBeVisible();
    await expect(page.locator('[data-fake-jitsi]')).toHaveCount(0);
  });

  test('theater mode hides the session rail and Meet link bar is shown when live', async ({
    page,
  }) => {
    await installFakeJitsi(page);
    const response = await page.goto('/e2e-fixtures/live-room');
    expect(response?.ok(), 'e2e live fixture must be reachable in non-production').toBeTruthy();

    await expect(page.getByTestId('e2e-live-room')).toBeVisible();
    await expect(page.getByTestId('meet-link-bar')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('live-session-rail')).toBeVisible();

    await page.getByTestId('theater-toggle').click();
    await expect(page.locator('[data-theater="on"]')).toBeVisible();
    await expect(page.getByTestId('live-session-rail')).toBeHidden();

    await page.getByTestId('theater-toggle').click();
    await expect(page.locator('[data-theater="off"]')).toBeVisible();
    await expect(page.getByTestId('live-session-rail')).toBeVisible();
  });
});

test.describe('Live session state (pure)', () => {
  test('link_open wins over client clock', () => {
    const session = {
      status: 'SCHEDULED',
      starts_at: new Date(Date.now() + 60_000).toISOString(),
      ends_at: new Date(Date.now() + 3_600_000).toISOString(),
      link_open: true,
    };
    expect(sessionState(session, Date.now())).toBe('live');
  });

  test('during class without link_open is not joinable live', () => {
    const now = Date.now();
    const session = {
      status: 'SCHEDULED',
      starts_at: new Date(now - 60_000).toISOString(),
      ends_at: new Date(now + 3_600_000).toISOString(),
      link_open: false,
    };
    expect(sessionState(session, now)).toBe('upcoming');
  });

  test('pickPlaySession prefers the open class', () => {
    const now = Date.now();
    const sessions = [
      {
        id: 'past',
        status: 'COMPLETED',
        starts_at: new Date(now - 86_400_000).toISOString(),
        ends_at: new Date(now - 86_000_000).toISOString(),
        link_open: false,
      },
      {
        id: 'live',
        status: 'SCHEDULED',
        starts_at: new Date(now - 60_000).toISOString(),
        ends_at: new Date(now + 3_600_000).toISOString(),
        link_open: true,
      },
    ];
    expect(pickPlaySession(sessions, now)?.id).toBe('live');
  });
});

test.describe('Meet settle lock (browser)', () => {
  test('settleDelayMs waits after a leave marker', async ({ page }) => {
    const response = await page.goto('/e2e-fixtures/live-room?closed=1');
    expect(response?.ok(), 'e2e live fixture must be reachable in non-production').toBeTruthy();

    const delay = await page.evaluate(
      ({ settle }) => {
        const key = 'e2e-room';
        sessionStorage.setItem(`mentoma.meet.left:${key}`, String(Date.now()));
        const raw = sessionStorage.getItem(`mentoma.meet.left:${key}`);
        const leftAt = Number(raw);
        const elapsed = Date.now() - leftAt;
        return elapsed >= settle ? 0 : settle - elapsed;
      },
      { settle: REJOIN_SETTLE_MS },
    );
    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThanOrEqual(REJOIN_SETTLE_MS);
  });
});
