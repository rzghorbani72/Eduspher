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
const DEFAULT_SCHOOL_SLUG = process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_SLUG ?? null;
const SCHOOL_ID_COOKIE = process.env.NEXT_PUBLIC_SCHOOL_ID_COOKIE ?? "eduspher_school_id";
const SCHOOL_SLUG_COOKIE = process.env.NEXT_PUBLIC_SCHOOL_SLUG_COOKIE ?? "eduspher_school_slug";
const SCHOOL_NAME_COOKIE = process.env.NEXT_PUBLIC_SCHOOL_NAME_COOKIE ?? "eduspher_school_name";
const SCHOOL_HEADER_ID = "x-school-id";
const SCHOOL_HEADER_SLUG = "x-school-slug";

type PublicSchool = {
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

const matchSchool = (
  schools: PublicSchool[],
  options: { slug?: string | null; host?: string | null; id?: string | null }
) => {
  const targetSlug = options.slug?.toLowerCase();
  const host = options.host?.toLowerCase();
  const hostWithoutSubdomain = host?.replace(/^www\./, "");
  const targetId = options.id ? String(options.id) : null;

  return schools.find((school) => {
    if (targetId && String(school.id) === targetId) {
      return true;
    }
    const schoolSlug = school.slug?.toLowerCase();
    if (targetSlug && schoolSlug === targetSlug) {
      return true;
    }
    const privateAddress = school.domain?.private_address?.toLowerCase();
    const publicAddress = school.domain?.public_address?.toLowerCase();
    if (host && privateAddress && (host === privateAddress || host.startsWith(`${privateAddress}.`))) {
      return true;
    }
    if (hostWithoutSubdomain && publicAddress && hostWithoutSubdomain === publicAddress) {
      return true;
    }
    return false;
  });
};

const fetchSchools = async () => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}${BACKEND_API_PATH}/schools/public`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: PublicSchool[] };
    return payload.data ?? null;
  } catch {
    return null;
  }
};

export async function middleware(request: NextRequest) {
  if (shouldBypass(request)) {
    return NextResponse.next();
  }

  const requestUrl = request.nextUrl;
  const existingId = request.cookies.get(SCHOOL_ID_COOKIE)?.value ?? null;
  const existingSlug = request.cookies.get(SCHOOL_SLUG_COOKIE)?.value ?? null;
  const existingNameCookie = request.cookies.get(SCHOOL_NAME_COOKIE)?.value ?? null;
  const decodedExistingName = existingNameCookie ? decodeURIComponent(existingNameCookie) : null;
  const pathnameSegments = requestUrl.pathname.split("/").filter(Boolean);
  const firstSegment = pathnameSegments[0] ?? null;
  const slugFromPath = firstSegment && !RESERVED_PATH_SEGMENTS.has(firstSegment) ? firstSegment : null;
  const searchParamSlug = requestUrl.searchParams.get("school");
  const hostHeader = extractHost(request.headers.get("host"));
  const candidateSlug = searchParamSlug ?? slugFromPath ?? extractCandidateSlug(hostHeader) ?? DEFAULT_SCHOOL_SLUG;
  const numericSlugId = slugFromPath && /^\d+$/.test(slugFromPath) ? slugFromPath : null;

  const schools = await fetchSchools();
  let matchedSchool: PublicSchool | null = null;

  if (schools) {
    matchedSchool = matchSchool(schools, {
      slug: candidateSlug,
      host: hostHeader ?? undefined,
      id: numericSlugId ?? existingId,
    }) ?? null;
  }

  if (!matchedSchool && numericSlugId && schools) {
    matchedSchool = matchSchool(schools, { id: numericSlugId }) ?? null;
  }

  if (!matchedSchool && existingId && schools) {
    matchedSchool = matchSchool(schools, { id: existingId }) ?? null;
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
    matchedSchool &&
    (String(matchedSchool.id) !== existingId || matchedSchool.slug !== existingSlug);

  if (matchedSchool && shouldUpdateCookies) {
    addCookie(SCHOOL_ID_COOKIE, String(matchedSchool.id));
    if (matchedSchool.slug) {
      addCookie(SCHOOL_SLUG_COOKIE, matchedSchool.slug);
      requestHeaders.set(SCHOOL_HEADER_SLUG, matchedSchool.slug);
    }
    addCookie(SCHOOL_NAME_COOKIE, encodeURIComponent(matchedSchool.name ?? ""));
    requestHeaders.set(SCHOOL_HEADER_ID, String(matchedSchool.id));
  } else if (existingId) {
    requestHeaders.set(SCHOOL_HEADER_ID, existingId);
    if (existingSlug) {
      requestHeaders.set(SCHOOL_HEADER_SLUG, existingSlug);
    }
  } else if (DEFAULT_SCHOOL_SLUG && schools) {
    const fallback = matchSchool(schools, {
      slug: DEFAULT_SCHOOL_SLUG,
      id: env.defaultSchoolId ? String(env.defaultSchoolId) : null,
    });
    if (fallback) {
      addCookie(SCHOOL_ID_COOKIE, String(fallback.id));
      if (fallback.slug) {
        addCookie(SCHOOL_SLUG_COOKIE, fallback.slug);
        requestHeaders.set(SCHOOL_HEADER_SLUG, fallback.slug);
      }
      addCookie(SCHOOL_NAME_COOKIE, encodeURIComponent(fallback.name ?? ""));
      requestHeaders.set(SCHOOL_HEADER_ID, String(fallback.id));
      matchedSchool = fallback;
    }
  }

  if (!requestHeaders.has(SCHOOL_HEADER_ID) && numericSlugId) {
    requestHeaders.set(SCHOOL_HEADER_ID, numericSlugId);
    if (!existingId) {
      addCookie(SCHOOL_ID_COOKIE, numericSlugId);
    }
  }

  if (!requestHeaders.has(SCHOOL_HEADER_SLUG) && slugFromPath) {
    requestHeaders.set(SCHOOL_HEADER_SLUG, slugFromPath);
    if (!existingSlug) {
      addCookie(SCHOOL_SLUG_COOKIE, slugFromPath);
    }
  }

  if (!cookiesToSet.some((cookie) => cookie.name === SCHOOL_NAME_COOKIE)) {
    const headerSchoolId = requestHeaders.get(SCHOOL_HEADER_ID);
    const nameFromList = headerSchoolId && schools
      ? matchSchool(schools ?? [], { id: headerSchoolId })?.name
      : null;
    const matchedName = matchedSchool?.name ?? nameFromList ?? decodedExistingName ?? env.siteName;
    addCookie(SCHOOL_NAME_COOKIE, encodeURIComponent(matchedName ?? env.siteName));
  }

  // Determine the actual path (without school slug) for authentication checks
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
    const redirectUrl = requestUrl.clone();
    redirectUrl.pathname = slugFromPath ? `/${slugFromPath}` : "/";
    redirectUrl.searchParams.delete("redirect");
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute && !isPublicRoute) {
    // Build login URL with school slug if present
    const loginPath = slugFromPath ? `/${slugFromPath}/auth/login` : "/auth/login";
    const loginUrl = new URL(loginPath, requestUrl);
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
      httpOnly: false, // School cookies are not httpOnly so they can be read by client
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
    const cleanedUrl = requestUrl.clone();
    cleanedUrl.searchParams.delete("school");
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

