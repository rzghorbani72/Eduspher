"use client";

import { useSyncExternalStore } from "react";

/**
 * One shared clock for every "is this live right now?" badge on the page.
 *
 * The server snapshot is `0` on purpose: the server has no idea what time it is
 * in the visitor's session, so it renders everything as "not yet started" and
 * the browser corrects it on the first tick. Anything else would hydrate with a
 * mismatch. A single module-level interval means N badges cost one timer.
 */
const TICK_MS = 30_000;

let snapshot = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (timer === null) {
    snapshot = Date.now();
    timer = setInterval(() => {
      snapshot = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
};

const getSnapshot = () => snapshot;
const getServerSnapshot = () => 0;

export const useNow = (): number =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
