import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { AcademyRequest } from './prepare-academy-request';
import { ACADEMY_COOKIES } from './resolve-academy-route';
import type { AcademyRoute } from './resolve-academy-route';
import { applySessionCookies } from './resolve-session';
import type { Session } from './resolve-session';

const isSecure = process.env.NODE_ENV === 'production';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const ONE_DAY_SECONDS = 60 * 60 * 24;

/** Which internal route serves this URL, or null when the URL is served as-is. */
function internalRewrite(route: AcademyRoute, academy: AcademyRequest): URL | null {
  const { requestUrl, slugFromPath } = route;
  const isRoot = requestUrl.pathname === '/' || requestUrl.pathname === '';
  if (route.isHostBound && academy.matchedStore && isRoot) {
    // Subdomain academy home: "/" → "/{slug}" so app/[slug]/page.tsx serves it.
    const url = requestUrl.clone();
    url.pathname = `/${academy.matchedStore.slug ?? route.subdomainSlug}`;
    return url;
  }
  if (slugFromPath && !route.isAcademyHomePath) {
    // Path-based routing: strip the academy slug so the shared route handles it.
    const url = requestUrl.clone();
    url.pathname = `/${route.pathnameSegments.slice(1).join('/')}`.replace(/\/+$/, '') || '/';
    return url;
  }
  return null;
}

function writeCookies(
  request: NextRequest,
  response: NextResponse,
  route: AcademyRoute,
  academy: AcademyRequest,
  session: Session,
) {
  for (const { name, value } of academy.academyCookies) {
    // Not httpOnly: the client reads the academy cookies.
    response.cookies.set(name, value, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure: isSecure,
      maxAge: ONE_YEAR_SECONDS,
    });
  }
  if (route.isPanelRoot) {
    for (const name of ACADEMY_COOKIES) response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  applySessionCookies(response, session);
  // After a refresh the backend's own Set-Cookie is authoritative.
  const jwtCookie = session.refreshedSetCookies.length > 0 ? null : request.cookies.get('jwt');
  if (jwtCookie) {
    response.cookies.set('jwt', jwtCookie.value, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: isSecure,
      maxAge: ONE_DAY_SECONDS,
    });
  }
}

/** `?academy=<slug>` links resolve the academy, then land on the clean URL. */
function academyParamRedirect(route: AcademyRoute, response: NextResponse): NextResponse {
  const { requestUrl } = route;
  const cleanedUrl = new URL(requestUrl.pathname, requestUrl.origin);
  cleanedUrl.search = requestUrl.search;
  cleanedUrl.searchParams.delete('academy');
  const redirect = NextResponse.redirect(cleanedUrl);
  // A NEW response: without copying, the visitor lands with no academy resolved.
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export function buildResponse(
  request: NextRequest,
  route: AcademyRoute,
  academy: AcademyRequest,
  session: Session,
): NextResponse {
  const { requestHeaders } = academy;
  const internalUrl = internalRewrite(route, academy);
  // The layout's isPanelRoot check must see the effective path, e.g. "/siah" not "/".
  requestHeaders.set('x-url-pathname', internalUrl?.pathname ?? route.requestUrl.pathname);
  // Downstream must not repeat the login redirect on an inconclusive refresh.
  if (session.refreshUnavailable) requestHeaders.set('x-auth-refresh-unavailable', '1');

  const init = { request: { headers: requestHeaders } };
  const response = internalUrl ? NextResponse.rewrite(internalUrl, init) : NextResponse.next(init);
  writeCookies(request, response, route, academy, session);

  if (route.searchParamSlug) {
    const redirect = academyParamRedirect(route, response);
    academy.frame(redirect);
    return redirect;
  }

  response.headers.set('x-pathname', internalUrl?.pathname ?? route.requestUrl.pathname);
  academy.frame(response);
  return response;
}
