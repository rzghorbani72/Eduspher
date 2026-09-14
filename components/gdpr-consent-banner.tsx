'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from '@/components/ui/link';
import { logger } from '@/lib/logging/app-logger';
import { getMarketingConsent, setMarketingConsent } from '@/lib/consent';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

const COOKIE_NAME = 'gdpr_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function cookieConsentNeeded(): boolean {
  return typeof document !== 'undefined' && getMarketingConsent() === null;
}

export function GdprConsentBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const needsConsent = useSyncExternalStore(
    () => () => {},
    cookieConsentNeeded,
    () => false,
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
      dir={direction}
      aria-label={t('cookieConsent.message')}
      className="border-border bg-background fixed inset-x-0 bottom-0 z-50 flex flex-col items-stretch gap-3 border-t px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
    >
      <p className="text-muted-foreground text-sm">
        {t('cookieConsent.message')}{' '}
        <Link href="/privacy" className="hover:text-foreground underline">
          {t('cookieConsent.learnMore')}
        </Link>
      </p>
      <div className="flex shrink-0 justify-end gap-2">
        <button
          onClick={decline}
          className="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
        >
          {t('cookieConsent.decline')}
        </button>
        <button
          onClick={accept}
          className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm hover:opacity-90"
        >
          {t('cookieConsent.accept')}
        </button>
      </div>
    </div>
  );
}
