const RESERVED_PATH_SEGMENTS = new Set([
  "",
  "api",
  "auth",
  "images",
  "static",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "s",
  "courses",
  "articles",
  "academies",
  "pricing",
  "checkout",
  "payment",
  "account",
  "about",
  "paths",
  "scholarships",
  "careers",
  "press",
  "support",
  "contact",
  "status",
  "legal",
]);

export function slugFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  if (segments[0] === "s" && segments[1]) {
    return segments[1];
  }

  const first = segments[0];
  if (RESERVED_PATH_SEGMENTS.has(first)) {
    return null;
  }

  return first;
}

export function buildAcademyPathFromSlug(
  slug: string | null,
  path: string
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!slug) {
    return normalized === "//" ? "/" : normalized;
  }
  if (normalized === "/") {
    return `/${slug}`;
  }
  return `/${slug}${normalized}`;
}
