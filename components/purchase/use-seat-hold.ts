'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { holdSeats, releaseSeatHold } from '@/lib/api/client';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export type SeatHoldState = {
  expiresAt: string | null;
  expired: boolean;
  full: boolean;
  renew: () => void;
  markExpired: () => void;
};

type HoldStatus = {
  expiresAt: string | null;
  expired: boolean;
  full: boolean;
};

const IDLE: HoldStatus = { expiresAt: null, expired: false, full: false };

/**
 * Holds seats while the checkout dialog is open and gives them back when it
 * closes. The hold is renewed whenever the seat count changes.
 */
export function useSeatHold(input: {
  groupId: string | null;
  seats: number;
  joinCode?: string;
  enabled: boolean;
}): SeatHoldState {
  const { groupId, seats, joinCode, enabled } = input;
  const [status, setStatus] = useState<HoldStatus>(IDLE);
  const heldGroup = useRef<string | null>(null);

  const renew = useCallback(() => {
    if (!enabled || !groupId || seats < 1) return;
    void holdSeats(groupId, seats, joinCode)
      .then((res) => {
        heldGroup.current = groupId;
        setStatus({
          expiresAt: res.data.expires_at,
          expired: false,
          full: false,
        });
      })
      .catch((err) => {
        setStatus({ expiresAt: null, expired: false, full: true });
        logger.warn('Payments', 'SeatHoldFailed', errorFields(err));
      });
  }, [enabled, groupId, seats, joinCode]);

  const release = useCallback(() => {
    const held = heldGroup.current;
    if (!held) return;
    heldGroup.current = null;
    void releaseSeatHold(held)
      .then(() => setStatus(IDLE))
      .catch(() => setStatus(IDLE));
  }, []);

  // Open → hold; closed → give the seats back. Unmount releases too.
  useEffect(() => {
    if (enabled) renew();
    else release();
  }, [enabled, renew, release]);
  useEffect(() => release, [release]);

  const markExpired = useCallback(() => {
    setStatus((prev) => ({ ...prev, expired: true }));
    logger.warn('Payments', 'SeatHoldExpired', { group_id: groupId ?? '' });
  }, [groupId]);

  return { ...status, renew, markExpired };
}
