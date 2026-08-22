import { env } from "@/lib/env";
import { seoDomains } from "./domains";
import type { SeoRequestContext } from "./request-context";

export function buildOrganizationJsonLd(ctx: SeoRequestContext): Record<string, unknown> {
  const supportEmail =
    ctx.region === "ir" ? "hello@mentoma.ir" : "hello@mentoma.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mentoma",
    alternateName: seoDomains.siteName,
    url: ctx.canonicalUrl,
    logo: `${env.appUrl}/favicon.ico`,
    email: supportEmail,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: supportEmail,
      availableLanguage: ["Persian", "English"],
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

export function buildWebSiteJsonLd(ctx: SeoRequestContext): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoDomains.siteName,
    url: ctx.canonicalUrl,
    inLanguage: ctx.region === "ir" ? "fa-IR" : "en",
    alternateName: "Mentoma",
  };
}
