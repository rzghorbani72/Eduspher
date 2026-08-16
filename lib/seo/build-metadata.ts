import type { Metadata } from "next";

import { env } from "@/lib/env";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAssetUrl } from "@/lib/utils";
import { seoDomains } from "./domains";
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

/**
 * The academy's own favicon, so a visitor's browser tab shows the academy brand
 * instead of the platform default. Null on the platform site and whenever the
 * academy has not uploaded one — Next then falls back to the static icon.
 */
async function resolveAcademyIcon(
  ctx: SeoRequestContext,
): Promise<string | null> {
  if (ctx.isPlatform) return null;
  try {
    const { slug } = await getAcademyContext();
    if (!slug) return null;
    const academy = await getAcademyBySlug(slug);
    const url = academy?.favicon?.publicUrl;
    return url ? resolveAssetUrl(url) : null;
  } catch {
    return null;
  }
}

export async function buildSiteMetadata(
  options: BuildMetadataOptions = {},
): Promise<Metadata> {
  const ctx = options.ctx ?? (await getSeoRequestContext());
  const platformPage = ctx.isPlatform ? getPlatformPageSeo(ctx.pathname) : null;

  const title = options.title ?? platformPage?.title ?? seoDomains.siteName;
  const description =
    options.description ??
    platformPage?.description ??
    seoDomains.siteDescription;

  const noIndex = shouldNoIndexPath(ctx.pathname);
  const iconUrl = await resolveAcademyIcon(ctx);
  const openGraphLocale = ctx.region === "ir" ? "fa_IR" : "en_US";
  const alternateLocale = ctx.region === "ir" ? "en_US" : "fa_IR";

  return {
    metadataBase: new URL(env.appUrl),
    title: {
      default: title,
      template: `%s | ${seoDomains.siteName}`,
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
      siteName: seoDomains.siteName,
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
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
