import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify, decodeJwt, type JWTPayload } from "jose";

import { env } from "./lib/env";

/**
 * Verify JWT token signature and decode payload
 * Uses jose library for secure JWT verification in Edge runtime
 */
async function verifyJWT(token: string): Promise<{ valid: boolean; payload: JWTPayload | null }> {
  try {
    const secret = process.env.JWT_SECRET;
    
    // In development or if no secret, fall back to decode-only with expiry check
    if (!secret) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ JWT_SECRET not set - JWT signature verification disabled. Set JWT_SECRET in production!');
      }
      const payload = decodeJwt(token);
      // At minimum, check expiration
      const isExpired = payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000;
      if (isExpired) {
        return { valid: false, payload: null };
      }
      return { valid: true, payload };
    }

    // Verify the token signature using the secret
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256']
    });

    return { valid: true, payload };
  } catch (error) {
    // Token verification failed (invalid signature, expired, malformed)
    return { valid: false, payload: null };
  }
}

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:3000";
const BACKEND_API_PATH = process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? "/api";
const DEFAULT_STORE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ?? null;
const STORE_ID_COOKIE = process.env.NEXT_PUBLIC_STORE_ID_COOKIE ?? "eduspher_store_id";
const STORE_SLUG_COOKIE = process.env.NEXT_PUBLIC_STORE_SLUG_COOKIE ?? "eduspher_store_slug";
const STORE_NAME_COOKIE = process.env.NEXT_PUBLIC_STORE_NAME_COOKIE ?? "eduspher_store_name";
const STORE_HEADER_ID = "x-store-id";
const STORE_HEADER_SLUG = "x-store-slug";

type PublicStore = {
  id: number;
  name: string;
  slug?: string | null;
  domain?: {
    public_address?: string | null;
    private_address?: string | null;
  } | null;
};

const shouldBypass = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
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
]);

// Define protected routes that require authentication
const protectedRoutes = ["/account"];

// Define public routes that don't require authentication
const publicRoutes = ["/", "/courses", "/articles", "/about", "/auth/login", "/auth/register", "/auth/forgot-password"];

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

const matchStore = (
  stores: PublicStore[],
  options: { slug?: string | null; host?: string | null; id?: string | null }
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
    if (host && privateAddress && (host === privateAddress || host.startsWith(`${privateAddress}.`))) {
      return true;
    }
    if (hostWithoutSubdomain && publicAddress && hostWithoutSubdomain === publicAddress) {
      return true;
    }
    return false;
  });
};

const fetchStores = async () => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}${BACKEND_API_PATH}/stores/public`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
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
  const existingId = request.cookies.get(STORE_ID_COOKIE)?.value ?? null;
  const existingSlug = request.cookies.get(STORE_SLUG_COOKIE)?.value ?? null;
  const existingNameCookie = request.cookies.get(STORE_NAME_COOKIE)?.value ?? null;
  const decodedExistingName = existingNameCookie ? decodeURIComponent(existingNameCookie) : null;
  const pathnameSegments = requestUrl.pathname.split("/").filter(Boolean);
  const firstSegment = pathnameSegments[0] ?? null;
  const slugFromPath = firstSegment && !RESERVED_PATH_SEGMENTS.has(firstSegment) ? firstSegment : null;
  const searchParamSlug = requestUrl.searchParams.get("store");
  const hostHeader = extractHost(request.headers.get("host"));
  const candidateSlug = searchParamSlug ?? slugFromPath ?? extractCandidateSlug(hostHeader) ?? DEFAULT_STORE_SLUG;
  const numericSlugId = slugFromPath && /^\d+$/.test(slugFromPath) ? slugFromPath : null;

  const stores = await fetchStores();
  let matchedStore: PublicStore | null = null;

  if (stores) {
    matchedStore = matchStore(stores, {
      slug: candidateSlug,
      host: hostHeader ?? undefined,
      id: numericSlugId ?? existingId,
    }) ?? null;
  }

  if (!matchedStore && numericSlugId && stores) {
    matchedStore = matchStore(stores, { id: numericSlugId }) ?? null;
  }

  if (!matchedStore && existingId && stores) {
    matchedStore = matchStore(stores, { id: existingId }) ?? null;
  }

  const requestHeaders = new Headers(request.headers);
  const cookiesToSet: Array<{ name: string; value: string }> = [];
  const addCookie = (name: string, value: string) => {
    const existing = cookiesToSet.find((cookie) => cookie.name === name && cookie.value === value);
    if (!existing) {
      cookiesToSet.push({ name, value });
    }
  };

  const shouldUpdateCookies =
    matchedStore &&
    (String(matchedStore.id) !== existingId || matchedStore.slug !== existingSlug);

  if (matchedStore && shouldUpdateCookies) {
    addCookie(STORE_ID_COOKIE, String(matchedStore.id));
    if (matchedStore.slug) {
      addCookie(STORE_SLUG_COOKIE, matchedStore.slug);
      requestHeaders.set(STORE_HEADER_SLUG, matchedStore.slug);
    }
    addCookie(STORE_NAME_COOKIE, encodeURIComponent(matchedStore.name ?? ""));
    requestHeaders.set(STORE_HEADER_ID, String(matchedStore.id));
  } else if (existingId) {
    requestHeaders.set(STORE_HEADER_ID, existingId);
    if (existingSlug) {
      requestHeaders.set(STORE_HEADER_SLUG, existingSlug);
    }
  } else if (DEFAULT_STORE_SLUG && stores) {
    const fallback = matchStore(stores, {
      slug: DEFAULT_STORE_SLUG,
      id: env.defaultStoreId ? String(env.defaultStoreId) : null,
    });
    if (fallback) {
      addCookie(STORE_ID_COOKIE, String(fallback.id));
      if (fallback.slug) {
        addCookie(STORE_SLUG_COOKIE, fallback.slug);
        requestHeaders.set(STORE_HEADER_SLUG, fallback.slug);
      }
      addCookie(STORE_NAME_COOKIE, encodeURIComponent(fallback.name ?? ""));
      requestHeaders.set(STORE_HEADER_ID, String(fallback.id));
      matchedStore = fallback;
    }
  }

  if (!requestHeaders.has(STORE_HEADER_ID) && numericSlugId) {
    requestHeaders.set(STORE_HEADER_ID, numericSlugId);
    if (!existingId) {
      addCookie(STORE_ID_COOKIE, numericSlugId);
    }
  }

  if (!requestHeaders.has(STORE_HEADER_SLUG) && slugFromPath) {
    requestHeaders.set(STORE_HEADER_SLUG, slugFromPath);
    if (!existingSlug) {
      addCookie(STORE_SLUG_COOKIE, slugFromPath);
    }
  }

  if (!cookiesToSet.some((cookie) => cookie.name === STORE_NAME_COOKIE)) {
    const headerStoreId = requestHeaders.get(STORE_HEADER_ID);
    const nameFromList = headerStoreId && stores
      ? matchStore(stores ?? [], { id: headerStoreId })?.name
      : null;
    const matchedName = matchedStore?.name ?? nameFromList ?? decodedExistingName ?? env.siteName;
    addCookie(STORE_NAME_COOKIE, encodeURIComponent(matchedName ?? env.siteName));
  }

  // Determine the actual path (without store slug) for authentication checks
  let actualPathname = requestUrl.pathname;
  if (slugFromPath) {
    const cleanedPathSegments = pathnameSegments.slice(1);
    actualPathname = `/${cleanedPathSegments.join("/")}`.replace(/\/+$/, "") || "/";
  }

  // Check authentication for protected routes
  const isProtectedRoute = protectedRoutes.some((route) => 
    actualPathname === route || actualPathname.startsWith(`${route}/`)
  );
  const isPublicRoute = publicRoutes.some((route) => 
    actualPathname === route || actualPathname.startsWith(`${route}/`)
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
      const hasProfileId = payload.profileId && (typeof payload.profileId === "number" || typeof payload.profileId === "string");
      const hasUserId = payload.userId && (typeof payload.userId === "number" || typeof payload.userId === "string");
      const hasValidId = hasProfileId || hasUserId;
      
      // Token is valid only if verified AND has required fields
      if (hasValidId) {
        isAuthenticated = true;
      }
    }
  }

  // If user is on an auth route and is already authenticated, redirect to home
  if (isAuthRoute && isAuthenticated && (actualPathname === "/auth/login" || actualPathname === "/auth/register")) {
    const redirectPath = slugFromPath ? `/${slugFromPath}` : "/";
    const redirectUrl = new URL(redirectPath, requestUrl.origin);
    redirectUrl.searchParams.delete("redirect");
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute && !isPublicRoute) {
    // Build login URL with store slug if present - use absolute URL
    const loginPath = slugFromPath ? `/${slugFromPath}/auth/login` : "/auth/login";
    const loginUrl = new URL(loginPath, requestUrl.origin);
    loginUrl.searchParams.set("redirect", requestUrl.pathname + requestUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  let internalUrl: URL | null = null;
  if (slugFromPath) {
    const cleanedPathSegments = pathnameSegments.slice(1);
    const cleanedPathname = `/${cleanedPathSegments.join("/")}`.replace(/\/+$/, "");
    const normalizedPath = cleanedPathname === "" ? "/" : cleanedPathname;
    internalUrl = requestUrl.clone();
    internalUrl.pathname = normalizedPath;
  }

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
    cleanedUrl.searchParams.delete("store");
    return NextResponse.redirect(cleanedUrl);
  }

  // Add pathname to headers for layout to detect home page
  const actualPath = internalUrl ? internalUrl.pathname : requestUrl.pathname;
  response.headers.set("x-pathname", actualPath);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

