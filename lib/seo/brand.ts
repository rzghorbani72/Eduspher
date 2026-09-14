import { env } from '@/lib/env';

/**
 * Canonical Mentoma brand strings for SERP site name, og:site_name, and JSON-LD.
 * Google prefers one short, consistent name across WebSite + visible homepage brand.
 * @see https://developers.google.com/search/docs/appearance/site-names
 */
export const MENTOMA_BRAND = {
  /** Preferred Google site name (Persian market). */
  fa: 'منتوما',
  /** Preferred Google site name (global market). */
  en: 'Mentoma',
  /** Latin product name — always available as alternateName. */
  latin: 'Mentoma',
  /** Domain fallback Google may use when confidence is low — all lowercase. */
  domainIr: 'mentoma.ir',
  domainCom: 'mentoma.com',
} as const;

export function mentomaSiteName(region: 'ir' | 'com'): string {
  return region === 'ir' ? MENTOMA_BRAND.fa : MENTOMA_BRAND.en;
}

export function mentomaAlternateNames(region: 'ir' | 'com'): string[] {
  if (region === 'ir') {
    return [MENTOMA_BRAND.latin, MENTOMA_BRAND.domainIr];
  }
  return [MENTOMA_BRAND.fa, MENTOMA_BRAND.domainCom];
}

/** Absolute platform brand assets — mark for icons/logo, type for wordmark image. */
export const MENTOMA_ASSETS = {
  markSvg: '/logo-mark.svg',
  markPng: '/logo-mark.png',
  typePng: '/logo-type.png',
  icon48: '/icon-48.png',
  icon192: '/icon-192.png',
  icon512: '/icon-512.png',
  appleTouch: '/apple-touch-icon.png',
} as const;

export function mentomaAssetUrl(path: string): string {
  return `${env.appUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
