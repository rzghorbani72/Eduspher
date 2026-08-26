import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

/**
 * Crawl policy for Mentoma.
 * Private student surfaces stay out of the index; public marketing + academy
 * catalog pages stay allowlisted for Google sitelinks and discovery.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.appUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/auth",
          "/checkout",
          "/payment",
          "/preview",
          "/learn",
          "/classes",
          "/api",
          "/academy-not-found",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ""),
  };
}
