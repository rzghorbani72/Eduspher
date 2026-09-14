import { env } from '@/lib/env';
import { MENTOMA_BRAND } from './brand';

export type MarketRegion = 'ir' | 'com';

const IR_HOST_SUFFIX = '.mentoma.ir';
const COM_HOST_SUFFIX = '.mentoma.com';

export const seoDomains = {
  ir: env.irDomain,
  com: env.comDomain,
  /** Always the Persian brand for IR default — SERP site name must be منتوما. */
  siteName: env.siteName?.trim() || MENTOMA_BRAND.fa,
  siteDescription: env.siteDescription,
} as const;

export function getRegionFromHostname(hostname: string): MarketRegion {
  const host = hostname.toLowerCase();
  if (host === 'mentoma.ir' || host === 'www.mentoma.ir' || host.endsWith(IR_HOST_SUFFIX)) {
    return 'ir';
  }
  return 'com';
}

export function swapHostnameRegion(hostname: string, targetRegion: MarketRegion): string {
  const host = hostname.toLowerCase();

  if (targetRegion === 'ir') {
    if (host.endsWith(COM_HOST_SUFFIX)) {
      return host.slice(0, -COM_HOST_SUFFIX.length) + IR_HOST_SUFFIX;
    }
    if (host === 'mentoma.com') return 'mentoma.ir';
    if (host === 'www.mentoma.com') return 'www.mentoma.ir';
    return host;
  }

  if (host.endsWith(IR_HOST_SUFFIX)) {
    return host.slice(0, -IR_HOST_SUFFIX.length) + COM_HOST_SUFFIX;
  }
  if (host === 'mentoma.ir') return 'mentoma.com';
  if (host === 'www.mentoma.ir') return 'www.mentoma.com';
  return host;
}

export function buildAbsoluteUrl(hostname: string, pathname: string, search = ''): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const normalizedPath =
    pathname === '' || pathname.startsWith('/') ? pathname || '/' : `/${pathname}`;
  return `${protocol}://${hostname}${normalizedPath}${search}`;
}

export function buildCrossMarketUrl(
  hostname: string,
  pathname: string,
  targetRegion: MarketRegion,
  search = '',
): string {
  const targetHost = swapHostnameRegion(hostname, targetRegion);
  return buildAbsoluteUrl(targetHost, pathname, search);
}

export function getAcademyPublicHost(slug: string, region?: MarketRegion): string {
  const resolvedRegion = region ?? getRegionFromHostname(new URL(env.appUrl).hostname);
  const baseHost =
    resolvedRegion === 'ir' ? new URL(env.irDomain).hostname : new URL(env.comDomain).hostname;
  return `${slug}.${baseHost}`;
}
