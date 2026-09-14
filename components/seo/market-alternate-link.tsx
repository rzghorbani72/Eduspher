'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { getCrossMarketHref, getCrossMarketLabel } from '@/lib/seo/market-link';
import { getRegionFromHostname } from '@/lib/seo/domains';

export function MarketAlternateLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { href, label, hrefLang } = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'mentoma.com';
    const search = searchParams.toString();
    const searchSuffix = search ? `?${search}` : '';
    const region = getRegionFromHostname(host);

    return {
      href: getCrossMarketHref(host, pathname, searchSuffix),
      label: getCrossMarketLabel(region),
      hrefLang: region === 'ir' ? 'en' : 'fa-IR',
    };
  }, [pathname, searchParams]);

  return (
    <a
      href={href}
      hrefLang={hrefLang}
      rel="alternate"
      style={{
        fontSize: 13,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        borderBottom: '1px dashed var(--bd)',
      }}
    >
      {label}
    </a>
  );
}
