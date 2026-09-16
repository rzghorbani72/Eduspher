'use client';

import { useEffect, useRef, useState } from 'react';

const NEAR_BOTTOM_PX = 64;

/** Follows new messages unless the reader has scrolled up to history. */
export function useStickToBottom(itemsLength: number) {
  const ref = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [away, setAway] = useState(false);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nextStick = distance < NEAR_BOTTOM_PX;
    stick.current = nextStick;
    setAway(!nextStick);
  };

  const jumpToLatest = () => {
    const el = ref.current;
    stick.current = true;
    setAway(false);
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (!stick.current) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [itemsLength]);

  return { ref, onScroll, away, jumpToLatest };
}
