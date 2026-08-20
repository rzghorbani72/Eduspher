import type { Metadata } from "next";

import { env } from "@/lib/env";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAssetUrl } from "@/lib/utils";
import { seoDomains } from "./domains";
import { getTrustBadge } from "@/lib/api/trust-badge";
import { ENAMAD_CODE, isEnamadTitleVerification } from "./enamad";
import { getPlatformPageSeo } from "./platform-pages";
import {
  getSeoRequestContext,
  shouldNoIndexPath,
  type SeoRequestContext,
} from "./request-context";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  ctx?: SeoRequestContext;
};

type AcademyBranding = { name: string | null; iconUrl: string | null };

/**
 * The academy's own name and favicon, so a visitor's tab shows the academy's
 * brand rather than the platform's. Empty on the platform site, and whenever
 * the academy is unreachable — callers then fall back to the platform values.
 *
 * `getAcademyBySlug` is request-cached, so asking for both costs one fetch.
 */
async function resolveAcademyBranding(
  ctx: SeoRequestContext,
): Promise<AcademyBranding> {
  const none: AcademyBranding = { name: null, iconUrl: null };
  if (ctx.isPlatform) return none;
  try {
    const { slug } = await getAcademyContext();
    if (!slug) return none;
    const academy = await getAcademyBySlug(slug);
    if (!academy) return none;
    const url = academy.favicon?.publicUrl;
    return {
      name: academy.name?.trim() || null,
      iconUrl: url ? resolveAssetUrl(url) : null,
    };
  } catch {
    return none;
  }
}

export async function buildSiteMetadata(
  options: BuildMetadataOptions = {},
): Promise<Metadata> {
  const ctx = options.ctx ?? (await getSeoRequestContext());
  const platformPage = ctx.isPlatform ? getPlatformPageSeo(ctx.pathname) : null;

  const { name: academyName, iconUrl } = await resolveAcademyBranding(ctx);

  // On an academy site the brand is the academy the manager named — the
  // platform name is our internal identity and must never surface there.
  const brandName = academyName ?? seoDomains.siteName;
  const baseTitle = options.title ?? platformPage?.title ?? brandName;
  const academyBadge =
    !ctx.isPlatform && ctx.academySlug
      ? await getTrustBadge(ctx.academySlug)
      : null;
  const isPlatformHome =
    ctx.isPlatform && ctx.region === "ir" && ctx.pathname === "/";
  const isAcademyHome = !ctx.isPlatform && ctx.pathname === "/";
  const enamadCode = isPlatformHome
    ? ENAMAD_CODE
    : isAcademyHome
      ? academyBadge?.enamad_code
      : null;
  const titleVerify = isPlatformHome
    ? isEnamadTitleVerification
    : Boolean(isAcademyHome && academyBadge?.enamad_title_verify);
  const title =
    enamadCode && titleVerify ? `${enamadCode} | ${baseTitle}` : baseTitle;
  const description =
    options.description ??
    platformPage?.description ??
    seoDomains.siteDescription;

  const noIndex = shouldNoIndexPath(ctx.pathname);
  const openGraphLocale = ctx.region === "ir" ? "fa_IR" : "en_US";
  const alternateLocale = ctx.region === "ir" ? "en_US" : "fa_IR";

  return {
    metadataBase: new URL(env.appUrl),
    title: {
      default: title,
      template: `%s | ${brandName}`,
    },
    description,
    alternates: {
      canonical: ctx.canonicalUrl,
      languages: {
        "fa-IR": ctx.alternateUrls.faIR,
        en: ctx.alternateUrls.en,
        "x-default": ctx.alternateUrls.xDefault,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: ctx.canonicalUrl,
      siteName: brandName,
      locale: openGraphLocale,
      alternateLocale: [alternateLocale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(iconUrl
      ? { icons: { icon: iconUrl, shortcut: iconUrl, apple: iconUrl } }
      : {}),
    ...(enamadCode ? { other: { enamad: enamadCode } } : {}),
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
