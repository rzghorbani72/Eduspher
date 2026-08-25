import { env } from "@/lib/env";
import { seoDomains } from "./domains";
import { PLATFORM_SITELINK_PATHS, getPlatformPageSeo } from "./platform-pages";
import { PLATFORM_SOCIAL_PROFILES } from "./platform-socials";
import type { SeoRequestContext } from "./request-context";

const ORG_ID = (origin: string) => `${origin}/#organization`;
const WEBSITE_ID = (origin: string) => `${origin}/#website`;

function platformOrigin(ctx: SeoRequestContext): string {
  return `https://${ctx.host}`;
}

export function buildOrganizationJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const supportEmail =
    ctx.region === "ir" ? "hello@mentoma.ir" : "hello@mentoma.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(origin),
    name: "Mentoma",
    alternateName: ["منتوما", seoDomains.siteName],
    url: origin,
    logo: {
      "@type": "ImageObject",
      url: `${env.appUrl}/logo-mark.svg`,
    },
    image: `${env.appUrl}/logo-type.png`,
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

/** Primary nav pages Google may promote as brand sitelinks. */
export function buildSiteNavigationJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const elements = PLATFORM_SITELINK_PATHS.map((path, index) => {
    const page = getPlatformPageSeo(path);
    return {
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: page?.navLabel ?? page?.title ?? path,
      description: page?.description,
      url: `${origin}${path}`,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${origin}/#sitenav`,
    name: ctx.region === "ir" ? "منوی اصلی منتوما" : "Mentoma main navigation",
    itemListElement: elements,
  };
}

export function buildWebSiteJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const page = getPlatformPageSeo("/");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(origin),
    name: seoDomains.siteName,
    alternateName: ["Mentoma", "منتوما"],
    url: origin,
    inLanguage: ctx.region === "ir" ? "fa-IR" : "en",
    description: page?.description ?? seoDomains.siteDescription,
    publisher: { "@id": ORG_ID(origin) },
    about: { "@id": ORG_ID(origin) },
  };
}

/** Product entity — helps brand queries resolve to Mentoma, not martial-arts noise. */
export function buildSoftwareApplicationJsonLd(
  ctx: SeoRequestContext,
): Record<string, unknown> {
  const origin = platformOrigin(ctx);
  const page = getPlatformPageSeo("/");

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${origin}/#product`,
    name: "Mentoma",
    alternateName: "منتوما",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: origin,
    description: page?.description ?? seoDomains.siteDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: ctx.region === "ir" ? "IRR" : "EUR",
      description:
        ctx.region === "ir"
          ? "۱۴ روز تست رایگان"
          : "14-day free trial",
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
                name: ctx.region === "ir" ? "خانه" : "Home",
                item: origin,
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
