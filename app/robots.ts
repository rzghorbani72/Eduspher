import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { env } from "@/lib/env";
import { buildAbsoluteUrl } from "@/lib/seo/domains";
import { CRAWL_DISALLOW_PATHS } from "@/lib/seo/crawl-policy";

/**
 * Crawl policy for Mentoma.
 * Private student surfaces stay out of the index; public marketing + academy
 * catalog pages stay allowlisted for Google sitelinks and discovery.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const host =
    headerStore.get("host")?.split(":")[0] ??
    new URL(env.appUrl).hostname;
  const baseUrl = buildAbsoluteUrl(host, "/").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...CRAWL_DISALLOW_PATHS],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [...CRAWL_DISALLOW_PATHS],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host,
  };
}
