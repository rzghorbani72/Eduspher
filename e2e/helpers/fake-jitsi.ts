import type { Page } from '@playwright/test';

/**
 * Install a fake JitsiMeetExternalAPI before the app boots so Mentoma Meet
 * never loads the real meet.mentoma.ir script in CI.
 */
export async function installFakeJitsi(page: Page): Promise<void> {
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
