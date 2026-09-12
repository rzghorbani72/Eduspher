'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { getMarketingConsent, onConsentChange } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

/**
 * GA4 + Microsoft Clarity for the PUBLIC marketing/storefront pages only.
 * Never renders under /account (authenticated) and never loads before the
 * GDPR banner is accepted — no learner activity or PII ever reaches Google.
 */
export function MarketingAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    onConsentChange,
    getMarketingConsent,
    () => null
  );

  const isPrivateRoute =
    pathname?.startsWith('/account') || pathname?.startsWith('/learn');
  if (isPrivateRoute || consent !== 'accepted' || (!GA_ID && !CLARITY_ID)) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      )}
      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");`}
        </Script>
      )}
    </>
  );
}
