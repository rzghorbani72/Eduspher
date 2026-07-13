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
