'use client';

import { toast } from 'react-toastify';

import { readLanguage, resolveStorefrontLoginHref } from '@/lib/api/notify-api-error';
import { t } from '@/lib/i18n';
import { logger } from '@/lib/logging/app-logger';
import { STORM_WINDOW_MS, trackRoute } from '@/lib/request-storm-guard';

let signingOut = false;

/**
 * One route hammered far above human speed means a render loop, a runaway
 * retry, or a hostile script. Client state is no longer trusted: on a
 * session-carrying route we sign out and wipe storage; pre-session auth
 * routes are just blocked until the window cools down.
 */
export function assertNoRequestStorm(method: string, path: string, isProtected: boolean): void {
  if (signingOut && isProtected) {
    throw new Error('Request storm detected. API calls paused.');
  }

  const storm = trackRoute(method, path);
  if (!storm.tripped) return;

  logger.error('RequestStorm', 'Tripped', {
    route: path.split('?')[0] ?? path,
    method: method.toUpperCase(),
    count: storm.count,
    window_ms: STORM_WINDOW_MS,
    is_protected: isProtected,
  });

  if (isProtected && typeof window !== 'undefined') {
    signingOut = true;
    toast.error(t('errors.requestStorm', readLanguage()));
    void import('@/lib/sign-out').then(({ signOut }) => signOut(resolveStorefrontLoginHref()));
  }

  throw new Error('Request storm detected. API calls paused.');
}
