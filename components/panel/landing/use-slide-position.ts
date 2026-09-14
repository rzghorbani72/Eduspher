'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CLICK_MS = 550;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Continuous position across a set of slides (0 → count - 1). Scroll reports
 * fractional values so panels resize with the scroll instead of jumping at a
 * threshold; a click tweens to a whole slide over a few frames. Both inputs
 * write the same single value, so they can never fight over the layout.
 */
export function useSlidePosition(count: number, eventName: string) {
  const [position, setPositionState] = useState(0);
  const nodeRef = useRef<HTMLElement>(null);
  const positionRef = useRef(0);
  const frameRef = useRef(0);

  const move = useCallback((next: number) => {
    positionRef.current = next;
    setPositionState(next);
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const onPosition = (event: Event) => {
      const next = (event as CustomEvent<number>).detail;
      if (typeof next !== 'number') return;
      cancelAnimationFrame(frameRef.current);
      move(next);
    };

    node.addEventListener(eventName, onPosition);
    return () => {
      node.removeEventListener(eventName, onPosition);
      cancelAnimationFrame(frameRef.current);
    };
  }, [eventName, move]);

  const goTo = useCallback(
    (index: number) => {
      cancelAnimationFrame(frameRef.current);
      const from = positionRef.current;
      const start = performance.now();

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / CLICK_MS);
        move(from + (index - from) * easeOut(t));
        if (t < 1) frameRef.current = requestAnimationFrame(step);
      };

      frameRef.current = requestAnimationFrame(step);
    },
    [move],
  );

  /** Direct, untweened write — for a source that already reports a settled
      value each step, like a horizontal-scroll carousel's nearest slide. */
  const setPosition = useCallback(
    (next: number) => {
      cancelAnimationFrame(frameRef.current);
      move(next);
    },
    [move],
  );

  const active = Math.min(count - 1, Math.max(0, Math.round(position)));

  return { nodeRef, position, active, goTo, setPosition };
}
