import type { NextRequest } from "next/server";

import { env } from "@/lib/env";

/** Listen-all addresses from Docker `HOSTNAME=0.0.0.0` — never a public site. */
const BIND_ALL_HOST = /^(0\.0\.0\.0|\[::\]|::)$/i;

function hostnameOf(hostOrUrl: string): string {
  const trimmed = hostOrUrl.trim().split(",")[0]?.trim() ?? "";
  if (!trimmed) return "";
  try {
    if (trimmed.includes("://")) return new URL(trimmed).hostname;
  } catch {
    return "";
  }
  return trimmed.split(":")[0] ?? "";
}

function isBindAllHost(hostOrUrl: string): boolean {
  return BIND_ALL_HOST.test(hostnameOf(hostOrUrl));
}

/**
 * Public origin for payment redirects. Never use `request.url` — Next standalone
 * sets HOSTNAME=0.0.0.0 for bind, which turns absolute URLs into 0.0.0.0:5000.
 */
export function resolvePublicRequestOrigin(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "development" ? "http" : "https");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const host = (forwardedHost ?? hostHeader)?.split(",")[0]?.trim();

  if (host && !isBindAllHost(host)) {
    return `${proto}://${host}`;
  }

  const originHeader = request.headers.get("origin");
  if (originHeader) {
    try {
      const origin = new URL(originHeader).origin;
      if (!isBindAllHost(origin)) return origin;
    } catch {
      // ignore malformed Origin
    }
  }

  if (!isBindAllHost(env.appUrl)) return env.appUrl;

  return env.irDomain;
}

/** Same rules for server components that only have a Headers bag. */
export function resolvePublicOriginFromHeaders(
  headerStore: Headers,
  fallback = env.appUrl,
): string {
  const proto =
    headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const host = (
    headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  )
    ?.split(",")[0]
    ?.trim();

  if (host && !isBindAllHost(host)) {
    return `${proto}://${host}`;
  }

  const clean = fallback.replace(/\/$/, "");
  if (!isBindAllHost(clean)) return clean;
  return env.irDomain;
}
