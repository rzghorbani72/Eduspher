import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify, decodeJwt, type JWTPayload } from "jose";

import { env } from "./lib/env";

let jwtSecretWarningLogged = false;

function getAdminFrameAncestors(): string {
  const origins = new Set<string>(["'self'"]);
  const candidates = [
    process.env.NEXT_PUBLIC_ADMIN_PANEL_URL,
    process.env.ADMIN_PANEL_URL,
    "http://localhost:4000",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      // ignore invalid URL values
    }
  }

  if (process.env.NODE_ENV === "development") {
    for (const origin of [
      "http://localhost:4000",
      "http://127.0.0.1:4000",
      "http://0.0.0.0:4000",
    ]) {
      origins.add(origin);
    }
  }

  return Array.from(origins).join(" ");
}

function shouldApplyPreviewEmbed(
  request: NextRequest,
  isAcademyHome: boolean,
): boolean {
  const { pathname, searchParams } = request.nextUrl;
  if (searchParams.has("preview") || searchParams.get("embed") === "1") {
    return true;
  }
  return pathname === "/" || isAcademyHome;
}

function applyPreviewEmbedRequest(
  request: NextRequest,
  requestHeaders: Headers,
): { preview: string | null; embed: boolean } {
  const preview = request.nextUrl.searchParams.get("preview");
  const embed = request.nextUrl.searchParams.get("embed") === "1";
  const sample = request.nextUrl.searchParams.get("sample") === "1";

  if (preview) {
    requestHeaders.set("x-preview-token", preview);
  }
  if (embed) {
    requestHeaders.set("x-embed-mode", "1");
  }
  if (sample) {
    requestHeaders.set("x-preview-sample", "1");
  }

  return { preview, embed };
}

function applyPreviewEmbedResponse(
  response: NextResponse,
  preview: string | null,
  embed: boolean,
): void {
  if (preview) {
    response.cookies.set("preview_token", preview, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });
  }
  if (embed) {
    response.cookies.set("embed_mode", "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });
  }

  const frameAncestors = embed ? getAdminFrameAncestors() : "'self'";
  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${frameAncestors}`,
  );
}

/**
 * Verify JWT token signature and decode payload
 * Uses jose library for secure JWT verification in Edge runtime
 */
async function verifyJWT(
  token: string,
): Promise<{ valid: boolean; payload: JWTPayload | null }> {
  try {
    const secret = process.env.JWT_SECRET;

    // In development or if no secret, fall back to decode-only with expiry check
    if (!secret) {
      if (process.env.NODE_ENV === "development" && !jwtSecretWarningLogged) {
        jwtSecretWarningLogged = true;
        console.warn(
          "⚠️ JWT_SECRET not set in edusphere — JWT signature verification disabled. Copy JWT_SECRET from Backend/.env into edusphere/.env.local",
        );
      }
      const payload = decodeJwt(token);
      // At minimum, check expiration
      const isExpired =
        payload.exp &&
        typeof payload.exp === "number" &&
        payload.exp < Date.now() / 1000;
      if (isExpired) {
        return { valid: false, payload: null };
      }
      return { valid: true, payload };
    }

    // Verify the token signature using the secret
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    return { valid: true, payload };
  } catch {
    // Token verification failed (invalid signature, expired, malformed)
    return { valid: false, payload: null };
  }
}

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:3000";
const BACKEND_API_PATH = process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? "/api";
const DEFAULT_ACADEMY_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_ACADEMY_SLUG ?? null;
const ACADEMY_ID_COOKIE =
  process.env.NEXT_PUBLIC_ACADEMY_ID_COOKIE ?? "skillforge_selected_academy_id";
const ACADEMY_SLUG_COOKIE =
  process.env.NEXT_PUBLIC_ACADEMY_SLUG_COOKIE ?? "eduspher_academy_slug";
const ACADEMY_NAME_COOKIE =
  process.env.NEXT_PUBLIC_ACADEMY_NAME_COOKIE ?? "eduspher_academy_name";
const ACADEMY_HEADER_ID = "x-academy-id";
const ACADEMY_HEADER_SLUG = "x-academy-slug";

type PublicStore = {
  id: number;
  name: string;
  slug?: string | null;
  domain?: {
    public_address?: string | null;
    private_address?: string | null;
  } | null;
};

const isBackendProxyPath = (pathname: string) =>
  /^\/(?:(?:fa|en|ar|tr)\/)?v1(?:\/|$)/.test(pathname);

const shouldBypass = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    isBackendProxyPath(pathname) ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  );
};

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
  // Academy-scoped routes
  "account",
  "articles",
  "bundles",
  "checkout",
  "courses",
  "learn",
  "payment",
  "preview",
  "roadmap",
  // Platform-only routes — must not be shadowed by an academy slug
  "about",
  "career",
  "contact",
  "pricing",
  "privacy",
  "refund",
  "terms",
]);

// Paths that belong to the platform itself, not any academy.
// Middleware sets x-panel-root: 1 for these so the layout renders platform chrome.
const PLATFORM_PATHS = new Set([
  "/",
  "",
  "/about",
  "/career",
  "/contact",
  "/pricing",
  "/privacy",
  "/refund",
  "/terms",
]);

// Define protected routes that require authentication
const protectedRoutes = ["/account", "/learn"];

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/courses",
  "/articles",
  "/about",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

const extractHost = (hostHeader?: string | null) => {
  if (!hostHeader) return null;
  return hostHeader.split(":")[0];
};

const extractCandidateSlug = (host?: string | null) => {
  if (!host) return null;
  if (host === "localhost" || host === "127.0.0.1") {
    return null;
  }
  const parts = host.split(".");
  if (parts.length <= 1) {
    return host;
  }
  const [firstPart] = parts;
  if (firstPart === "www") {
    return parts[1] ?? null;
  }
  return firstPart;
};

const BASE_DOMAIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost")
      .hostname;
  } catch {
    return "localhost";
  }
})();

const extractSubdomainSlug = (hostname: string | null): string | null => {
  if (!hostname) return null;
  if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`)
    return null;
  if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
    const sub = hostname.slice(0, hostname.length - BASE_DOMAIN.length - 1);
    if (sub && sub !== "www") return sub;
  }
  return null;
};

const matchStore = (
  stores: PublicStore[],
  options: { slug?: string | null; host?: string | null; id?: string | null },
) => {
  const targetSlug = options.slug?.toLowerCase();
  const host = options.host?.toLowerCase();
  const hostWithoutSubdomain = host?.replace(/^www\./, "");
  const targetId = options.id ? String(options.id) : null;

  return stores.find((store) => {
    if (targetId && String(store.id) === targetId) {
      return true;
    }
    const storeSlug = store.slug?.toLowerCase();
    if (targetSlug && storeSlug === targetSlug) {
      return true;
    }
    const privateAddress = store.domain?.private_address?.toLowerCase();
    const publicAddress = store.domain?.public_address?.toLowerCase();
    if (
      host &&
      privateAddress &&
      (host === privateAddress || host.startsWith(`${privateAddress}.`))
    ) {
      return true;
    }
    if (
      hostWithoutSubdomain &&
      publicAddress &&
      hostWithoutSubdomain === publicAddress
    ) {
      return true;
    }
    return false;
  });
};

const fetchStores = async () => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}${BACKEND_API_PATH}/academies/public`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: PublicStore[] };
    return payload.data ?? null;
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  if (shouldBypass(request)) {
    return NextResponse.next();
  }

  const requestUrl = request.nextUrl;
  const existingId = request.cookies.get(ACADEMY_ID_COOKIE)?.value ?? null;
  const existingSlug = request.cookies.get(ACADEMY_SLUG_COOKIE)?.value ?? null;
  const existingNameCookie =
    request.cookies.get(ACADEMY_NAME_COOKIE)?.value ?? null;
  const decodedExistingName = existingNameCookie
    ? decodeURIComponent(existingNameCookie)
    : null;
  const pathnameSegments = requestUrl.pathname.split("/").filter(Boolean);
  const firstSegment = pathnameSegments[0] ?? null;
  const searchParamSlug = requestUrl.searchParams.get("academy");
  const hostHeader = extractHost(request.headers.get("host"));
  const subdomainSlug = extractSubdomainSlug(hostHeader);
  const isSubdomainRequest = Boolean(subdomainSlug);
  // On subdomain requests the first path segment is never an academy slug.
  const slugFromPath =
    !isSubdomainRequest &&
    firstSegment &&
    !RESERVED_PATH_SEGMENTS.has(firstSegment)
      ? firstSegment
      : null;
  const isAcademyHomePath =
    Boolean(slugFromPath) && pathnameSegments.length === 1;
  const candidateSlug =
    searchParamSlug ??
    slugFromPath ??
    subdomainSlug ??
    extractCandidateSlug(hostHeader) ??
    DEFAULT_ACADEMY_SLUG;
  const numericSlugId =
    slugFromPath && /^\d+$/.test(slugFromPath) ? slugFromPath : null;

  const stores = await fetchStores();
  const pathAcademySlug = searchParamSlug ?? slugFromPath;
  const hasPathAcademy = Boolean(pathAcademySlug);
  const isPanelRoot =
    !isSubdomainRequest &&
    !hasPathAcademy &&
    PLATFORM_PATHS.has(requestUrl.pathname);
  let matchedStore: PublicStore | null = null;

  if (stores) {
    if (subdomainSlug) {
      matchedStore =
        matchStore(stores, {
          slug: subdomainSlug,
          host: hostHeader ?? undefined,
        }) ?? null;
    }
    if (!matchedStore && pathAcademySlug) {
      matchedStore =
        matchStore(stores, {
          slug: pathAcademySlug,
          host: hostHeader ?? undefined,
        }) ?? null;
    }
    if (!matchedStore && numericSlugId) {
      matchedStore = matchStore(stores, { id: numericSlugId }) ?? null;
    }
    if (!matchedStore && !isPanelRoot) {
      matchedStore =
        matchStore(stores, {
          slug: candidateSlug,
          host: hostHeader ?? undefined,
          id: numericSlugId ?? undefined,
        }) ?? null;
    }
    if (
      !matchedStore &&
      !isSubdomainRequest &&
      !hasPathAcademy &&
      !isPanelRoot &&
      existingId
    ) {
      matchedStore = matchStore(stores, { id: existingId }) ?? null;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-public-pathname", requestUrl.pathname);
  if (requestUrl.search) {
    requestHeaders.set("x-public-search", requestUrl.search);
  }
  const applyPreviewEmbed = shouldApplyPreviewEmbed(request, isAcademyHomePath);
  const previewEmbed = applyPreviewEmbed
    ? applyPreviewEmbedRequest(request, requestHeaders)
    : { preview: null, embed: false };
  // x-url-pathname is set after rewrite decision (see below) so the layout
  // sees the effective pathname, not the original "/" that would incorrectly
  // trigger isPanelRoot for subdomain academy requests.
  if (isPanelRoot) {
    requestHeaders.set("x-panel-root", "1");
  } else if (isSubdomainRequest) {
    requestHeaders.set("x-academy-subdomain", "1");
    if (requestUrl.pathname === "/" || requestUrl.pathname === "") {
      requestHeaders.set("x-academy-home", "1");
    }
  } else if (slugFromPath) {
    requestHeaders.set("x-academy-from-path", "1");
    requestHeaders.set("x-academy-path-slug", slugFromPath);
    if (isAcademyHomePath) {
      requestHeaders.set("x-academy-home", "1");
    }
  }
  const cookiesToSet: Array<{ name: string; value: string }> = [];
  const addCookie = (name: string, value: string) => {
    const existing = cookiesToSet.find(
      (cookie) => cookie.name === name && cookie.value === value,
    );
    if (!existing) {
      cookiesToSet.push({ name, value });
    }
  };

  const applyMatchedStore = (store: PublicStore) => {
    addCookie(ACADEMY_ID_COOKIE, String(store.id));
    if (store.slug) {
      addCookie(ACADEMY_SLUG_COOKIE, store.slug);
      requestHeaders.set(ACADEMY_HEADER_SLUG, store.slug);
    }
    addCookie(ACADEMY_NAME_COOKIE, encodeURIComponent(store.name ?? ""));
    requestHeaders.set(ACADEMY_HEADER_ID, String(store.id));
  };

  if (matchedStore && !isPanelRoot) {
    applyMatchedStore(matchedStore);
  } else if (!isPanelRoot && !hasPathAcademy && existingId) {
    requestHeaders.set(ACADEMY_HEADER_ID, existingId);
    if (existingSlug) {
      requestHeaders.set(ACADEMY_HEADER_SLUG, existingSlug);
    }
  } else if (
    !isPanelRoot &&
    !hasPathAcademy &&
    DEFAULT_ACADEMY_SLUG &&
    stores
  ) {
    const fallback = matchStore(stores, {
      slug: DEFAULT_ACADEMY_SLUG,
      id: env.defaultAcademyId ? String(env.defaultAcademyId) : null,
    });
    if (fallback) {
      applyMatchedStore(fallback);
      matchedStore = fallback;
    }
  }

  if (!cookiesToSet.some((cookie) => cookie.name === ACADEMY_NAME_COOKIE)) {
    const headerStoreId = requestHeaders.get(ACADEMY_HEADER_ID);
    const nameFromList =
      headerStoreId && stores
        ? matchStore(stores ?? [], { id: headerStoreId })?.name
        : null;
    const matchedName =
      matchedStore?.name ?? nameFromList ?? decodedExistingName ?? env.siteName;
    addCookie(
      ACADEMY_NAME_COOKIE,
      encodeURIComponent(matchedName ?? env.siteName),
    );
  }

  // Determine the actual path (without store slug) for authentication checks
  let actualPathname = requestUrl.pathname;
  if (slugFromPath) {
    const cleanedPathSegments = pathnameSegments.slice(1);
    actualPathname =
      `/${cleanedPathSegments.join("/")}`.replace(/\/+$/, "") || "/";
  }

  // Check authentication for protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      actualPathname === route || actualPathname.startsWith(`${route}/`),
  );
  const isPublicRoute = publicRoutes.some(
    (route) =>
      actualPathname === route || actualPathname.startsWith(`${route}/`),
  );
  const isAuthRoute = actualPathname.startsWith("/auth/");

  // Get and validate the token from cookies
  // Verify JWT signature AND check required fields
  const token = request.cookies.get("jwt")?.value;
  let isAuthenticated = false;

  if (token) {
    const { valid, payload } = await verifyJWT(token);

    if (valid && payload) {
      // Check if token has required fields (profileId or userId)
      const hasProfileId =
        payload.profileId &&
        (typeof payload.profileId === "number" ||
          typeof payload.profileId === "string");
      const hasUserId =
        payload.userId &&
        (typeof payload.userId === "number" ||
          typeof payload.userId === "string");
      const hasValidId = hasProfileId || hasUserId;

      // Token is valid only if verified AND has required fields
      if (hasValidId) {
        isAuthenticated = true;
      }
    }
  }

  // If user is on an auth route and is already authenticated, redirect to home
  if (
    isAuthRoute &&
    isAuthenticated &&
    (actualPathname === "/auth/login" || actualPathname === "/auth/register")
  ) {
    const redirectPath = slugFromPath ? `/${slugFromPath}` : "/";
    const redirectUrl = new URL(redirectPath, requestUrl.origin);
    redirectUrl.searchParams.delete("redirect");
    const redirectResponse = NextResponse.redirect(redirectUrl);
    if (applyPreviewEmbed) {
      applyPreviewEmbedResponse(
        redirectResponse,
        previewEmbed.preview,
        previewEmbed.embed,
      );
    }
    return redirectResponse;
  }

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute && !isPublicRoute) {
    // Build login URL with store slug if present - use absolute URL
    const loginPath = slugFromPath
      ? `/${slugFromPath}/auth/login`
      : "/auth/login";
    const loginUrl = new URL(loginPath, requestUrl.origin);
    loginUrl.searchParams.set(
      "redirect",
      requestUrl.pathname + requestUrl.search,
    );
    const loginRedirect = NextResponse.redirect(loginUrl);
    if (applyPreviewEmbed) {
      applyPreviewEmbedResponse(
        loginRedirect,
        previewEmbed.preview,
        previewEmbed.embed,
      );
    }
    return loginRedirect;
  }

  let internalUrl: URL | null = null;
  if (
    isSubdomainRequest &&
    matchedStore &&
    (requestUrl.pathname === "/" || requestUrl.pathname === "")
  ) {
    // Subdomain academy home: rewrite "/" → "/{slug}" so app/[slug]/page.tsx serves it.
    internalUrl = requestUrl.clone();
    internalUrl.pathname = `/${matchedStore.slug ?? subdomainSlug}`;
  } else if (slugFromPath && !isAcademyHomePath) {
    // Path-based routing: strip the academy slug prefix so the shared route handles it.
    const cleanedPathSegments = pathnameSegments.slice(1);
    const cleanedPathname = `/${cleanedPathSegments.join("/")}`.replace(
      /\/+$/,
      "",
    );
    const normalizedPath = cleanedPathname === "" ? "/" : cleanedPathname;
    internalUrl = requestUrl.clone();
    internalUrl.pathname = normalizedPath;
  }

  // Set x-url-pathname to the EFFECTIVE path after rewrite so the layout's
  // isPanelRoot check sees "/siah" (not "/") for subdomain home requests.
  requestHeaders.set(
    "x-url-pathname",
    internalUrl?.pathname ?? requestUrl.pathname,
  );

  const response = internalUrl
    ? NextResponse.rewrite(internalUrl, {
        request: {
          headers: requestHeaders,
        },
      })
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

  cookiesToSet.forEach(({ name, value }) => {
    response.cookies.set(name, value, {
      path: "/",
      sameSite: "lax",
      httpOnly: false, // Store cookies are not httpOnly so they can be read by client
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  });

  if (isPanelRoot) {
    for (const name of [
      ACADEMY_ID_COOKIE,
      ACADEMY_SLUG_COOKIE,
      ACADEMY_NAME_COOKIE,
    ]) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
  }

  // Ensure jwt cookie from request is preserved if it exists
  const jwtCookie = request.cookies.get("jwt");
  if (jwtCookie) {
    response.cookies.set("jwt", jwtCookie.value, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  if (searchParamSlug) {
    const cleanedUrl = new URL(requestUrl.pathname, requestUrl.origin);
    cleanedUrl.search = requestUrl.search;
    cleanedUrl.searchParams.delete("academy");
    const academyRedirect = NextResponse.redirect(cleanedUrl);
    // The redirect is a NEW response, so the academy cookies written above are
    // not on it. Without this the visitor lands on the clean URL with no
    // academy resolved, which is what made "?academy=<slug>" links open the
    // default academy instead of the one they named.
    for (const cookie of response.cookies.getAll()) {
      academyRedirect.cookies.set(cookie);
    }
    if (applyPreviewEmbed) {
      applyPreviewEmbedResponse(
        academyRedirect,
        previewEmbed.preview,
        previewEmbed.embed,
      );
    }
    return academyRedirect;
  }

  // Add pathname to headers for layout to detect home page
  const actualPath = internalUrl ? internalUrl.pathname : requestUrl.pathname;
  response.headers.set("x-pathname", actualPath);

  if (applyPreviewEmbed) {
    applyPreviewEmbedResponse(
      response,
      previewEmbed.preview,
      previewEmbed.embed,
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
