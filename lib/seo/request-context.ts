import "server-only";

import { headers } from "next/headers";

import { getAcademyContext } from "@/lib/store-context";
import {
  buildAbsoluteUrl,
  buildCrossMarketUrl,
  getRegionFromHostname,
  type MarketRegion,
} from "./domains";

export type SeoRequestContext = {
  host: string;
  pathname: string;
  search: string;
  region: MarketRegion;
  isPlatform: boolean;
  isSubdomain: boolean;
  academySlug: string | null;
  canonicalUrl: string;
  alternateUrls: {
    faIR: string;
    en: string;
    xDefault: string;
  };
};

const NOINDEX_PATH_PREFIXES = [
  "/auth",
  "/account",
  "/checkout",
  "/payment",
  "/preview",
  "/learn",
  "/classes",
  "/academy-not-found",
] as const;

export function shouldNoIndexPath(pathname: string): boolean {
  return NOINDEX_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function getSeoRequestContext(): Promise<SeoRequestContext> {
  const headerStore = await headers();
  const storeContext = await getAcademyContext();

  const host =
    headerStore.get("host")?.split(":")[0] ??
    headerStore.get("x-forwarded-host")?.split(":")[0] ??
    "localhost";

  const pathname =
    headerStore.get("x-public-pathname") ??
    headerStore.get("x-url-pathname") ??
    "/";
  const search = headerStore.get("x-public-search") ?? "";

  const isPlatform = headerStore.get("x-panel-root") === "1";
  const isSubdomain = headerStore.get("x-academy-subdomain") === "1";
  const academySlug =
    headerStore.get("x-academy-slug") ??
    headerStore.get("x-academy-path-slug") ??
    storeContext.slug;

  const region = getRegionFromHostname(host);
  // Canonicals must ignore query strings — tracking params would split ranking.
  const canonicalUrl = buildAbsoluteUrl(host, pathname);
  const alternateUrls = {
    faIR: buildCrossMarketUrl(host, pathname, "ir"),
    en: buildCrossMarketUrl(host, pathname, "com"),
    xDefault: buildCrossMarketUrl(host, pathname, "ir"),
  };

  return {
    host,
    pathname,
    search,
    region,
    isPlatform,
    isSubdomain,
    academySlug,
    canonicalUrl,
    alternateUrls,
  };
}
