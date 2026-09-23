/**
 * Hang up before dispose so Prosody drops the muc occupant (IFrame API practice).
 * dispose() alone often leaves a ghost until the reconnect grace ends.
 */

export type JitsiLeaveApi = {
  dispose: () => void;
  addListener: (event: string, listener: () => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
};

const HANGUP_WAIT_MS = 1_500;

export const leaveJitsiConference = async (api: JitsiLeaveApi): Promise<void> => {
  await new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        api.dispose();
      } catch {
        // already disposed
      }
      resolve();
    };

    const timer = setTimeout(finish, HANGUP_WAIT_MS);
    const onLeft = () => {
      clearTimeout(timer);
      finish();
    };

    try {
      api.addListener('readyToClose', onLeft);
      api.addListener('videoConferenceLeft', onLeft);
      api.executeCommand('hangup');
    } catch {
      clearTimeout(timer);
      finish();
    }
  });
};

/** Sync best-effort leave for pagehide / beforeunload (cannot await). */
export const leaveJitsiSync = (api: JitsiLeaveApi | null): void => {
  if (!api) return;
  try {
    api.executeCommand('hangup');
  } catch {
    // ignore
  }
  try {
    api.dispose();
  } catch {
    // ignore
  }
};
