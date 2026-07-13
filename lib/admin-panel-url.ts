import { env } from "@/lib/env";

const stripPort = (host: string) => host.split(":")[0].toLowerCase();

/**
 * Registrable domain of the current host, e.g. "mentoma.ir" for
 * "siah.mentoma.ir" or "www.mentoma.com" → "mentoma.com". Assumes single-label
 * TLDs (.ir/.com) — enough for our markets. Returns null for localhost/IP/dev,
 * where there is no admin subdomain to derive.
 */
function baseDomainFromHost(host: string): string | null {
  const clean = stripPort(host).replace(/^www\./, "");
  if (clean === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(clean)) return null;
  const labels = clean.split(".");
  if (labels.length < 2) return null;
  return labels.slice(-2).join(".");
}

/** Admin panel origin for the current host: admin.<base-domain>, or the
 *  configured fallback when the host is unknown (dev/localhost/SSR). */
export function adminOriginFromHost(host?: string | null): string {
  const base = host ? baseDomainFromHost(host) : null;
  return base ? `https://admin.${base}` : env.adminPanelOrigin;
}

export function getAdminPanelUrl(path = "", host?: string | null): string {
  const resolvedHost =
    host ?? (typeof window !== "undefined" ? window.location.host : null);
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${adminOriginFromHost(resolvedHost)}${normalized}`;
}
