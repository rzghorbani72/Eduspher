import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { accountIndexPath } from './lib/account-index-path';
import { env } from './lib/env';
import { maybeEnamadTxtResponse } from './lib/seo/enamad-txt-response';
import {
  shouldApplyPreviewEmbed,
  applyPreviewEmbedRequest,
  applyFrameAncestors,
  applyPreviewEmbedResponse,
  verifyJWT,
  DEFAULT_ACADEMY_SLUG,
  ACADEMY_ID_COOKIE,
  ACADEMY_SLUG_COOKIE,
  ACADEMY_NAME_COOKIE,
  ACADEMY_HEADER_ID,
  ACADEMY_HEADER_SLUG,
  ACADEMY_NOT_FOUND_PATH,
  PublicStore,
  shouldBypass,
  RESERVED_PATH_SEGMENTS,
  PLATFORM_PATHS,
  protectedRoutes,
  publicRoutes,
  extractHost,
  extractCandidateSlug,
  extractSubdomainSlug,
  matchStore,
  matchStoreByCustomHost,
  fetchStores,
  withCookie,
  refreshSession,
} from './lib/proxy/proxy-helpers';

export async function proxy(request: NextRequest) {
  const enamadTxt = await maybeEnamadTxtResponse(request);
  if (enamadTxt) return enamadTxt;

  if (shouldBypass(request)) {
    return NextResponse.next();
  }

  const requestUrl = request.nextUrl;
  const existingId = request.cookies.get(ACADEMY_ID_COOKIE)?.value ?? null;
  const existingSlug = request.cookies.get(ACADEMY_SLUG_COOKIE)?.value ?? null;
  const existingNameCookie = request.cookies.get(ACADEMY_NAME_COOKIE)?.value ?? null;
  const decodedExistingName = existingNameCookie ? decodeURIComponent(existingNameCookie) : null;
  const pathnameSegments = requestUrl.pathname.split('/').filter(Boolean);
  const firstSegment = pathnameSegments[0] ?? null;
  const searchParamSlug = requestUrl.searchParams.get('academy');
  const hostHeader = extractHost(request.headers.get('host'));
  const subdomainSlug = extractSubdomainSlug(hostHeader);
  const stores = await fetchStores();
  // Custom domains carry the academy in the Host header the same way Mentoma
  // subdomains do — path segments must stay as real routes, never as slugs.
  const customDomainStore = stores ? matchStoreByCustomHost(stores, hostHeader) : null;
  const isHostBoundRequest = Boolean(subdomainSlug) || Boolean(customDomainStore);
  const isSubdomainRequest = isHostBoundRequest;
  // On host-bound requests the first path segment is never an academy slug.
  const slugFromPath =
    !isHostBoundRequest && firstSegment && !RESERVED_PATH_SEGMENTS.has(firstSegment)
      ? firstSegment
      : null;
  const isAcademyHomePath = Boolean(slugFromPath) && pathnameSegments.length === 1;
  const candidateSlug =
    searchParamSlug ??
    slugFromPath ??
    subdomainSlug ??
    customDomainStore?.slug ??
    extractCandidateSlug(hostHeader) ??
    DEFAULT_ACADEMY_SLUG;
  const numericSlugId = slugFromPath && /^\d+$/.test(slugFromPath) ? slugFromPath : null;

  const pathAcademySlug = searchParamSlug ?? slugFromPath;
  const hasPathAcademy = Boolean(pathAcademySlug);
  const isPanelRoot =
    !isHostBoundRequest && !hasPathAcademy && PLATFORM_PATHS.has(requestUrl.pathname);
  let matchedStore: PublicStore | null = customDomainStore;

  if (stores) {
    if (!matchedStore && subdomainSlug) {
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
    if (!matchedStore && !isHostBoundRequest && !hasPathAcademy && !isPanelRoot && existingId) {
      matchedStore = matchStore(stores, { id: existingId }) ?? null;
    }
  }

  // A host-bound name (Mentoma subdomain or custom domain) maps to one academy
  // and nothing else. If it resolves to no academy we must never fall through
  // to the platform landing page — that would serve platform marketing under a
  // tenant's own brand host.
  if (isHostBoundRequest && !matchedStore) {
    if (!stores) {
      // Backend unreachable: this is an outage, not a missing academy. A 404
      // here would tell search engines the academy is permanently gone.
      return new NextResponse(null, {
        status: 503,
        headers: { 'Retry-After': '30' },
      });
    }
    const notFoundUrl = requestUrl.clone();
    notFoundUrl.pathname = ACADEMY_NOT_FOUND_PATH;
    notFoundUrl.search = '';
    const notFoundResponse = NextResponse.rewrite(notFoundUrl);
    // Drop any academy left in cookies from an earlier host, so the 404 never
    // renders another academy's brand on this hostname.
    for (const name of [ACADEMY_ID_COOKIE, ACADEMY_SLUG_COOKIE, ACADEMY_NAME_COOKIE]) {
      notFoundResponse.cookies.set(name, '', { path: '/', maxAge: 0 });
    }
    return notFoundResponse;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-public-pathname', requestUrl.pathname);
  if (requestUrl.search) {
    requestHeaders.set('x-public-search', requestUrl.search);
  }
  const applyPreviewEmbed = shouldApplyPreviewEmbed(request, isAcademyHomePath);
  const previewEmbed = applyPreviewEmbed
    ? applyPreviewEmbedRequest(request, requestHeaders)
    : { preview: null, embed: false };
  // x-url-pathname is set after rewrite decision (see below) so the layout
  // sees the effective pathname, not the original "/" that would incorrectly
  // trigger isPanelRoot for subdomain academy requests.
  if (isPanelRoot) {
    requestHeaders.set('x-panel-root', '1');
  } else if (isSubdomainRequest) {
    requestHeaders.set('x-academy-subdomain', '1');
    if (requestUrl.pathname === '/' || requestUrl.pathname === '') {
      requestHeaders.set('x-academy-home', '1');
    }
  } else if (slugFromPath) {
    requestHeaders.set('x-academy-from-path', '1');
    requestHeaders.set('x-academy-path-slug', slugFromPath);
    if (isAcademyHomePath) {
      requestHeaders.set('x-academy-home', '1');
    }
  }
  const cookiesToSet: Array<{ name: string; value: string }> = [];
  const addCookie = (name: string, value: string) => {
    const existing = cookiesToSet.find((cookie) => cookie.name === name && cookie.value === value);
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
    addCookie(ACADEMY_NAME_COOKIE, encodeURIComponent(store.name ?? ''));
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
    !isSubdomainRequest &&
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
      headerStoreId && stores ? matchStore(stores ?? [], { id: headerStoreId })?.name : null;
    const matchedName = matchedStore?.name ?? nameFromList ?? decodedExistingName ?? env.siteName;
    addCookie(ACADEMY_NAME_COOKIE, encodeURIComponent(matchedName ?? env.siteName));
  }

  // Determine the actual path (without store slug) for authentication checks
  let actualPathname = requestUrl.pathname;
  if (slugFromPath) {
    const cleanedPathSegments = pathnameSegments.slice(1);
    actualPathname = `/${cleanedPathSegments.join('/')}`.replace(/\/+$/, '') || '/';
  }

  // Check authentication for protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) => actualPathname === route || actualPathname.startsWith(`${route}/`),
  );
  const isPublicRoute = publicRoutes.some(
    (route) => actualPathname === route || actualPathname.startsWith(`${route}/`),
  );
  const isAuthRoute = actualPathname.startsWith('/auth/');

  // Get and validate the token from cookies
  // Verify JWT signature AND check required fields
  const token = request.cookies.get('jwt')?.value;
  let isAuthenticated = false;

  if (token) {
    const { valid, payload } = await verifyJWT(token);

    if (valid && payload) {
      // Check if token has required fields (profileId or userId)
      const hasProfileId =
        payload.profileId &&
        (typeof payload.profileId === 'number' || typeof payload.profileId === 'string');
      const hasUserId =
        payload.userId &&
        (typeof payload.userId === 'number' || typeof payload.userId === 'string');
      const hasValidId = hasProfileId || hasUserId;

      // Token is valid only if verified AND has required fields
      if (hasValidId) {
        isAuthenticated = true;
      }
    }
  }

  // Expired/missing access token but a live refresh token: mint a new one here so
  // the visitor stays logged in for the full refresh-token lifetime (~7 days).
  let refreshedSetCookies: string[] = [];
  let dropRefreshCookie = false;
  // "unavailable" means we could not prove the refresh token is dead (network
  // blip / backend 5xx while calling our own refresh endpoint) — the visitor
  // must not be bounced to login over that, only over an explicit rejection.
  let refreshUnavailable = false;

  if (!isAuthenticated) {
    const refreshed = await refreshSession(request);
    if (refreshed.status === 'refreshed') {
      isAuthenticated = true;
      refreshedSetCookies = refreshed.setCookies;
      // Server components read the request cookies, so this render must already
      // see the new token instead of the stale one.
      requestHeaders.set('cookie', withCookie(request.headers.get('cookie'), 'jwt', refreshed.jwt));
    } else if (refreshed.status === 'invalid') {
      dropRefreshCookie = Boolean(request.cookies.get('refresh_token')?.value);
    } else {
      refreshUnavailable = true;
    }
  }

  // Auth cookies are decided once and copied onto whichever response we return.
  const applyAuthCookies = (target: NextResponse) => {
    for (const cookie of refreshedSetCookies) {
      target.headers.append('set-cookie', cookie);
    }
    if (dropRefreshCookie) {
      target.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
    }
  };

  // If user is on an auth route and is already authenticated, redirect to home
  if (
    isAuthRoute &&
    isAuthenticated &&
    (actualPathname === '/auth/login' || actualPathname === '/auth/register')
  ) {
    const redirectPath = slugFromPath ? `/${slugFromPath}` : '/';
    const redirectUrl = new URL(redirectPath, requestUrl.origin);
    redirectUrl.searchParams.delete('redirect');
    const redirectResponse = NextResponse.redirect(redirectUrl);
    applyAuthCookies(redirectResponse);
    if (applyPreviewEmbed) {
      applyPreviewEmbedResponse(
        redirectResponse,
        previewEmbed.preview,
        previewEmbed.embed,
        isAcademyHomePath,
      );
    } else {
      applyFrameAncestors(redirectResponse, { embed: false, allowMarketing: false });
    }
    return redirectResponse;
  }

  // If user is not authenticated and trying to access a protected route, redirect to login.
  // Skip this when the refresh attempt itself was unavailable — a transient
  // backend blip must not log out a visitor who may still hold a valid session.
  if (!isAuthenticated && isProtectedRoute && !isPublicRoute && !refreshUnavailable) {
    // Build login URL with store slug if present - use absolute URL
    const loginPath = slugFromPath ? `/${slugFromPath}/auth/login` : '/auth/login';
    const loginUrl = new URL(loginPath, requestUrl.origin);
    loginUrl.searchParams.set('redirect', requestUrl.pathname + requestUrl.search);
    const loginRedirect = NextResponse.redirect(loginUrl);
    applyAuthCookies(loginRedirect);
    if (applyPreviewEmbed) {
      applyPreviewEmbedResponse(
        loginRedirect,
        previewEmbed.preview,
        previewEmbed.embed,
        isAcademyHomePath,
      );
    } else {
      applyFrameAncestors(loginRedirect, { embed: false, allowMarketing: false });
    }
    return loginRedirect;
  }

  // Bare /account is only an entry point: bounce here instead of rendering the
  // account layout (three backend calls) just to redirect from its page.
  if (actualPathname === '/account') {
    const prefix = slugFromPath ? `/${slugFromPath}` : '';
    const accountUrl = new URL(
      `${prefix}${accountIndexPath(requestUrl.searchParams.get('tab'))}`,
      requestUrl.origin,
    );
    const accountRedirect = NextResponse.redirect(accountUrl);
    applyAuthCookies(accountRedirect);
    return accountRedirect;
  }

  let internalUrl: URL | null = null;
  if (
    isSubdomainRequest &&
    matchedStore &&
    (requestUrl.pathname === '/' || requestUrl.pathname === '')
  ) {
    // Subdomain academy home: rewrite "/" → "/{slug}" so app/[slug]/page.tsx serves it.
    internalUrl = requestUrl.clone();
    internalUrl.pathname = `/${matchedStore.slug ?? subdomainSlug}`;
  } else if (slugFromPath && !isAcademyHomePath) {
    // Path-based routing: strip the academy slug prefix so the shared route handles it.
    const cleanedPathSegments = pathnameSegments.slice(1);
    const cleanedPathname = `/${cleanedPathSegments.join('/')}`.replace(/\/+$/, '');
    const normalizedPath = cleanedPathname === '' ? '/' : cleanedPathname;
    internalUrl = requestUrl.clone();
    internalUrl.pathname = normalizedPath;
  }

  // Set x-url-pathname to the EFFECTIVE path after rewrite so the layout's
  // isPanelRoot check sees "/siah" (not "/") for subdomain home requests.
  requestHeaders.set('x-url-pathname', internalUrl?.pathname ?? requestUrl.pathname);

  // Lets a downstream server component know it must not repeat the login
  // redirect on a stale/expired jwt — the refresh attempt above was
  // inconclusive, not a proven-dead session.
  if (refreshUnavailable) {
    requestHeaders.set('x-auth-refresh-unavailable', '1');
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
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Store cookies are not httpOnly so they can be read by client
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  });

  if (isPanelRoot) {
    for (const name of [ACADEMY_ID_COOKIE, ACADEMY_SLUG_COOKIE, ACADEMY_NAME_COOKIE]) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 });
    }
  }

  applyAuthCookies(response);

  // Ensure jwt cookie from request is preserved if it exists.
  // Skipped after a refresh — the backend's own Set-Cookie is authoritative.
  const jwtCookie = refreshedSetCookies.length > 0 ? null : request.cookies.get('jwt');
  if (jwtCookie) {
    response.cookies.set('jwt', jwtCookie.value, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  if (searchParamSlug) {
    const cleanedUrl = new URL(requestUrl.pathname, requestUrl.origin);
    cleanedUrl.search = requestUrl.search;
    cleanedUrl.searchParams.delete('academy');
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
        isAcademyHomePath,
      );
    } else {
      applyFrameAncestors(academyRedirect, { embed: false, allowMarketing: false });
    }
    return academyRedirect;
  }

  // Add pathname to headers for layout to detect home page
  const actualPath = internalUrl ? internalUrl.pathname : requestUrl.pathname;
  response.headers.set('x-pathname', actualPath);

  if (applyPreviewEmbed) {
    applyPreviewEmbedResponse(
      response,
      previewEmbed.preview,
      previewEmbed.embed,
      isAcademyHomePath,
    );
  } else {
    applyFrameAncestors(response, { embed: false, allowMarketing: false });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|api/health).*)'],
};
