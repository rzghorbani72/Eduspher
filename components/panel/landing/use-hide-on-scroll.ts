'use client';

import { useEffect, useRef, useState } from 'react';

const ALWAYS_VISIBLE_ABOVE = 80;
const DELTA_THRESHOLD = 8;

/**
 * Hides the header while scrolling down and reveals it while scrolling up.
 * Reads scroll in a passive listener and only ever toggles a boolean, so the
 * header animates via `transform` and never triggers layout.
 */
export function useHideOnScroll(): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (Math.abs(delta) < DELTA_THRESHOLD) return;
      lastY.current = y;

      setHidden(y > ALWAYS_VISIBLE_ABOVE && delta > 0);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return hidden;
}
