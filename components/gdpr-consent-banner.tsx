'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from '@/components/ui/link';
import { logger } from '@/lib/logging/app-logger';
import { getMarketingConsent, setMarketingConsent } from '@/lib/consent';

const COOKIE_NAME = 'gdpr_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function cookieConsentNeeded(): boolean {
  return typeof document !== 'undefined' && getMarketingConsent() === null;
}

export function GdprConsentBanner() {
  const [dismissed, setDismissed] = useState(false);
  const needsConsent = useSyncExternalStore(
    () => () => {},
    cookieConsentNeeded,
    () => false
  );
  const visible = needsConsent && !dismissed;

  function accept() {
    setMarketingConsent(COOKIE_NAME, 'accepted', COOKIE_MAX_AGE);
    logger.event('Gdpr', 'ConsentAccepted', { surface: 'website' });
    setDismissed(true);
  }

  function decline() {
    setMarketingConsent(COOKIE_NAME, 'declined', COOKIE_MAX_AGE);
    logger.event('Gdpr', 'ConsentDeclined', { surface: 'website' });
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-background px-4 py-3 shadow-lg sm:px-6"
    >
      <p className="text-sm text-muted-foreground">
        We use cookies to deliver this service and to improve your experience.{' '}
        <Link href="/privacy" className="underline hover:text-foreground">
          Learn more
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={decline}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
