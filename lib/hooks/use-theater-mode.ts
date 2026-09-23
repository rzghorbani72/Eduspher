'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mentoma.learn.theater';

let snapshot = false;
const listeners = new Set<() => void>();

const read = (): boolean => {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const write = (value: boolean): void => {
  snapshot = value;
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // private mode
    }
  }
  listeners.forEach((notify) => notify());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) snapshot = read();
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => snapshot;
const getServerSnapshot = () => false;

/**
 * Shared “bigger stage” mode for offline learn and live classroom.
 * Collapses the curriculum / session rail without leaving the page.
 */
export function useTheaterMode(): {
  theater: boolean;
  setTheater: (value: boolean) => void;
  toggleTheater: () => void;
} {
  const theater = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheater = useCallback((value: boolean) => write(value), []);
  const toggleTheater = useCallback(() => write(!snapshot), []);
  return { theater, setTheater, toggleTheater };
}
