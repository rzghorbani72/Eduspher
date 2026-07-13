import {
  buildCrossMarketUrl,
  getRegionFromHostname,
  type MarketRegion,
} from "./domains";

export function getAlternateMarketRegion(
  hostname: string
): MarketRegion {
  return getRegionFromHostname(hostname) === "ir" ? "com" : "ir";
}

export function getCrossMarketHref(
  hostname: string,
  pathname: string,
  search = ""
): string {
  const targetRegion = getAlternateMarketRegion(hostname);
  return buildCrossMarketUrl(hostname, pathname, targetRegion, search);
}

export function getCrossMarketLabel(currentRegion: MarketRegion): string {
  return currentRegion === "ir"
    ? "International (mentoma.com)"
    : "نسخه ایران (mentoma.ir)";
}
