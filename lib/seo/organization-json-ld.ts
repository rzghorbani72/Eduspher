import { env } from "@/lib/env";
import {
  MENTOMA_ASSETS,
  mentomaAlternateNames,
  mentomaAssetUrl,
  mentomaSiteName,
} from "./brand";
import { PLATFORM_SITELINK_CANDIDATES, getPlatformPageSeo } from "./platform-pages";
import { PLATFORM_SOCIAL_PROFILES } from "./platform-socials";
import type { SeoRequestContext } from "./request-context";

const ORG_ID = (origin: string) => `${origin}/#organization`;
const WEBSITE_ID = (origin: string) => `${origin}/#website`;

function platformOrigin(ctx: SeoRequestContext): string {
  return `https://${ctx.host}`;
}

function platformHomeUrl(ctx: SeoRequestContext): string {
  return `${platformOrigin(ctx)}/`;
}

export function buildOrganizationJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const brand = mentomaSiteName(ctx.region);
  const supportEmail =
    ctx.region === "ir" ? "hello@mentoma.ir" : "hello@mentoma.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(origin),
    name: brand,
    alternateName: mentomaAlternateNames(ctx.region),
    url: platformHomeUrl(ctx),
    logo: {
      "@type": "ImageObject",
      url: mentomaAssetUrl(MENTOMA_ASSETS.markPng),
      width: 512,
      height: 512,
      caption: brand,
    },
    image: mentomaAssetUrl(MENTOMA_ASSETS.typePng),
    email: supportEmail,
    sameAs: [...PLATFORM_SOCIAL_PROFILES],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: supportEmail,
      availableLanguage: ["fa", "en", "Persian", "English"],
      areaServed: ctx.region === "ir" ? "IR" : "Worldwide",
    },
  };
}

type AcademyOrganization = {
  name: string;
  description: string | null;
  logoUrl: string | null;
};

/**
 * An academy site is a school in its own right, not a page of ours — so it gets
 * its own EducationalOrganization, never the platform's Organization.
 */
export function buildAcademyOrganizationJsonLd(
  academy: AcademyOrganization,
  ctx: SeoRequestContext,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: academy.name,
    url: ctx.canonicalUrl,
    inLanguage: ctx.region === "ir" ? "fa-IR" : "en",
    ...(academy.description ? { description: academy.description } : {}),
    ...(academy.logoUrl ? { logo: academy.logoUrl } : {}),
  };
}

/**
 * Individual SiteNavigationElement nodes — clearer sitelink candidates than a
 * bare ItemList (Yektanet-style submenu titles + short descriptions).
 */
export function buildSiteNavigationJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown>[] {
  const origin = platformOrigin(ctx);
  const loginUrl = `${env.adminPanelOrigin}/login`;

  return PLATFORM_SITELINK_CANDIDATES.map((item, index) => {
    const page = item.path ? getPlatformPageSeo(item.path) : null;
    const url =
      item.kind === "login"
        ? loginUrl
        : `${origin}${item.path ?? "/"}`;
    return {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      "@id": `${origin}/#nav-${item.id}`,
      position: index + 1,
      name: item.label,
      description: item.description ?? page?.description,
      url,
    };
  });
}

/**
 * Google site-name signal — `name` must be the Persian brand on .ir.
 * `alternateName` ends with the bare domain so Google has a confident fallback
 * instead of inventing a worse label.
 */
export function buildWebSiteJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const page = getPlatformPageSeo("/");
  const brand = mentomaSiteName(ctx.region);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(origin),
    name: brand,
    alternateName: mentomaAlternateNames(ctx.region),
    url: platformHomeUrl(ctx),
    inLanguage: ctx.region === "ir" ? "fa-IR" : "en",
    description: page?.description ?? seoDescriptionFallback(ctx),
    publisher: { "@id": ORG_ID(origin) },
    about: { "@id": ORG_ID(origin) },
  };
}

function seoDescriptionFallback(ctx: SeoRequestContext): string {
  return ctx.region === "ir"
    ? "منتوما پلتفرم ساخت وبسایت آموزشی برای آموزشگاه‌ها"
    : "Mentoma — academy website and teaching platform";
}

export function buildSoftwareApplicationJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const page = getPlatformPageSeo("/");
  const brand = mentomaSiteName(ctx.region);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${origin}/#product`,
    name: brand,
    alternateName: mentomaAlternateNames(ctx.region),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: platformHomeUrl(ctx),
    description: page?.description ?? seoDescriptionFallback(ctx),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: ctx.region === "ir" ? "IRR" : "EUR",
      description:
        ctx.region === "ir" ? "۱۴ روز تست رایگان" : "14-day free trial",
      url: `${origin}/pricing`,
    },
    provider: { "@id": ORG_ID(origin) },
  };
}

export function buildPlatformWebPageJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> | null {
  const page = getPlatformPageSeo(ctx.pathname);
  if (!page) return null;

  const origin = platformOrigin(ctx);
  const isHome = ctx.pathname === "/" || ctx.pathname === "";

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${ctx.canonicalUrl}#webpage`,
    url: ctx.canonicalUrl,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": WEBSITE_ID(origin) },
    about: { "@id": ORG_ID(origin) },
    inLanguage: ctx.region === "ir" ? "fa-IR" : "en",
    ...(isHome
      ? {}
      : {
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: mentomaSiteName(ctx.region),
                item: platformHomeUrl(ctx),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: page.navLabel ?? page.title,
                item: ctx.canonicalUrl,
              },
            ],
          },
        }),
  };
}
