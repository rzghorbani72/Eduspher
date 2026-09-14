'use client';

import { useCallback } from 'react';

import { notifyOtpSent } from '@/lib/otp-notify';

/** "Code sent" feedback for every auth screen: one toast, no code. */
export function useOtpNotifier() {
  return useCallback((message: string, toastId?: string) => notifyOtpSent(message, toastId), []);
}
