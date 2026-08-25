import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { env } from "@/lib/env";
import {
  buildAbsoluteUrl,
  buildCrossMarketUrl,
} from "@/lib/seo/domains";
import {
  PLATFORM_SITEMAP_PATHS,
  getSitemapPriority,
} from "@/lib/seo/platform-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const host =
    headerStore.get("host")?.split(":")[0] ??
    new URL(env.appUrl).hostname;
  const now = new Date();

  return PLATFORM_SITEMAP_PATHS.map((path) => {
    const url = buildAbsoluteUrl(host, path);
    const faIR = buildCrossMarketUrl(host, path, "ir");
    const en = buildCrossMarketUrl(host, path, "com");

    return {
      url,
      lastModified: now,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: getSitemapPriority(path),
      alternates: {
        languages: {
          "fa-IR": faIR,
          en,
          "x-default": en,
        },
      },
    };
  });
}
