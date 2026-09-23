/**
 * Prosody keeps a disconnected occupant briefly so flaky clients can recover
 * (jitsi/docker-jitsi-meet#2176). Mentoma must wait before the same JWT user
 * rejoins, or classmates see a duplicate tile.
 */

export const REJOIN_SETTLE_MS = 2_500;

/** Cap so a crashed tab cannot block joining for minutes. */
export const REJOIN_SETTLE_MAX_MS = 5_000;

const storageKey = (roomKey: string): string => `mentoma.meet.left:${roomKey}`;

export const markMeetLeft = (roomKey: string, at: number = Date.now()): void => {
  if (typeof sessionStorage === 'undefined' || !roomKey) return;
  try {
    sessionStorage.setItem(storageKey(roomKey), String(at));
  } catch {
    // private mode / quota — settle still applies via in-memory path
  }
};

export const clearMeetLeft = (roomKey: string): void => {
  if (typeof sessionStorage === 'undefined' || !roomKey) return;
  try {
    sessionStorage.removeItem(storageKey(roomKey));
  } catch {
    // ignore
  }
};

/** Milliseconds to wait before creating a new External API for this room. */
export const settleDelayMs = (
  roomKey: string,
  now: number = Date.now(),
  settleMs: number = REJOIN_SETTLE_MS,
): number => {
  if (!roomKey) return 0;
  if (typeof sessionStorage === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(storageKey(roomKey));
    if (!raw) return 0;
    const leftAt = Number(raw);
    if (!Number.isFinite(leftAt)) return settleMs;
    const elapsed = now - leftAt;
    if (elapsed >= settleMs) return 0;
    return Math.min(settleMs - elapsed, REJOIN_SETTLE_MAX_MS);
  } catch {
    return settleMs;
  }
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
