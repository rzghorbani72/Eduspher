import type { Metadata } from 'next';

import { env } from '@/lib/env';
import { getAcademyBySlug } from '@/lib/api/server';
import { getAcademyContext } from '@/lib/store-context';
import { resolveAssetUrl } from '@/lib/utils';
import { MENTOMA_ASSETS, mentomaSiteName } from './brand';
import { seoDomains } from './domains';
import { getTrustBadge } from '@/lib/api/trust-badge';
import { ENAMAD_CODE } from './enamad';
import { getPlatformPageSeo } from './platform-pages';
import { NOINDEX_ROBOTS } from './crawl-policy';
import { getSeoRequestContext, shouldNoIndexPath, type SeoRequestContext } from './request-context';

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  ctx?: SeoRequestContext;
};

type AcademyBranding = {
  name: string | null;
  iconUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
};

const trimmed = (value: string | null | undefined): string | null => value?.trim() || null;

/**
 * The academy's own brand and manager-authored SEO text, so search results and
 * shared links show the academy rather than the platform. Empty on the platform
 * site, and whenever the academy is unreachable — callers then fall back to the
 * platform values.
 *
 * `getAcademyBySlug` is request-cached, so asking for all of it costs one fetch.
 */
async function resolveAcademyBranding(ctx: SeoRequestContext): Promise<AcademyBranding> {
  const none: AcademyBranding = {
    name: null,
    iconUrl: null,
    metaTitle: null,
    metaDescription: null,
    ogImageUrl: null,
  };
  if (ctx.isPlatform) return none;
  try {
    const { slug } = await getAcademyContext();
    if (!slug) return none;
    const academy = await getAcademyBySlug(slug);
    if (!academy) return none;
    const url = academy.favicon?.publicUrl;
    const ogUrl = academy.og_image?.publicUrl;
    return {
      name: trimmed(academy.name),
      iconUrl: url ? resolveAssetUrl(url) : null,
      metaTitle: trimmed(academy.meta_title),
      // The manager's own academy description is a far better fallback than our
      // platform copy, which describes us and not them.
      metaDescription: trimmed(academy.meta_description) ?? trimmed(academy.description),
      ogImageUrl: ogUrl ? resolveAssetUrl(ogUrl) : null,
    };
  } catch {
    return none;
  }
}

const PLATFORM_ICONS: NonNullable<Metadata['icons']> = {
  icon: [
    { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    { url: MENTOMA_ASSETS.icon48, sizes: '48x48', type: 'image/png' },
    { url: MENTOMA_ASSETS.icon192, sizes: '192x192', type: 'image/png' },
    { url: MENTOMA_ASSETS.icon512, sizes: '512x512', type: 'image/png' },
    { url: MENTOMA_ASSETS.markSvg, type: 'image/svg+xml' },
  ],
  shortcut: MENTOMA_ASSETS.icon48,
  apple: [{ url: MENTOMA_ASSETS.appleTouch, sizes: '180x180', type: 'image/png' }],
};

export async function buildSiteMetadata(options: BuildMetadataOptions = {}): Promise<Metadata> {
  const ctx = options.ctx ?? (await getSeoRequestContext());
  const platformPage = ctx.isPlatform ? getPlatformPageSeo(ctx.pathname) : null;

  const {
    name: academyName,
    iconUrl,
    metaTitle,
    metaDescription,
    ogImageUrl,
  } = await resolveAcademyBranding(ctx);

  // Platform SERP site-name must be منتوما — never a Latin-only fallback.
  const brandName =
    academyName ?? (ctx.isPlatform ? mentomaSiteName(ctx.region) : seoDomains.siteName);
  const baseTitle = options.title ?? platformPage?.title ?? metaTitle ?? brandName;
  const academyBadge =
    !ctx.isPlatform && ctx.academySlug ? await getTrustBadge(ctx.academySlug) : null;
  const isPlatformHome = ctx.isPlatform && ctx.region === 'ir' && ctx.pathname === '/';
  const isAcademyHome = !ctx.isPlatform && ctx.pathname === '/';
  const enamadCode = isPlatformHome
    ? ENAMAD_CODE
    : isAcademyHome
      ? academyBadge?.enamad_code
      : null;
  // Keep Enamad verification out of <title> — a numeric prefix looks unprofessional
  // in Google and weakens the منتوما site-name signal. Code stays in meta "enamad".
  const title = baseTitle;
  const description =
    options.description ??
    platformPage?.description ??
    metaDescription ??
    seoDomains.siteDescription;

  const noIndex = shouldNoIndexPath(ctx.pathname);
  const openGraphLocale = ctx.region === 'ir' ? 'fa_IR' : 'en_US';
  const alternateLocale = ctx.region === 'ir' ? 'en_US' : 'fa_IR';
  const titleIsFullyBranded = Boolean(ctx.isPlatform && (options.title || platformPage));
  const platformOgImage = ctx.isPlatform ? `${env.appUrl}/landing/hero-wide.webp` : null;
  const shareImage = ogImageUrl ?? platformOgImage;
  const keywords = platformPage?.keywords;

  return {
    metadataBase: new URL(env.appUrl),
    applicationName: brandName,
    title: titleIsFullyBranded
      ? { absolute: title }
      : {
          default: title,
          template: `%s | ${brandName}`,
        },
    description,
    ...(keywords?.length ? { keywords: [...keywords] } : {}),
    ...(ctx.isPlatform
      ? {
          appleWebApp: {
            title: brandName,
            capable: true,
          },
          manifest: '/site.webmanifest',
        }
      : {}),
    alternates: {
      canonical: ctx.canonicalUrl,
      languages: {
        'fa-IR': ctx.alternateUrls.faIR,
        en: ctx.alternateUrls.en,
        'x-default': ctx.alternateUrls.xDefault,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: ctx.canonicalUrl,
      siteName: brandName,
      locale: openGraphLocale,
      alternateLocale: [alternateLocale],
      ...(shareImage ? { images: [{ url: shareImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    icons: iconUrl
      ? { icon: iconUrl, shortcut: iconUrl, apple: iconUrl }
      : ctx.isPlatform
        ? PLATFORM_ICONS
        : undefined,
    ...(enamadCode ? { other: { enamad: enamadCode } } : {}),
    robots: noIndex ? NOINDEX_ROBOTS : { index: true, follow: true },
  };
}
