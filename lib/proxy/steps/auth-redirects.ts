import { accountIndexPath } from '../../account-index-path';
import { protectedRoutes, publicRoutes } from '../proxy-helpers';
import type { AcademyRoute } from './resolve-academy-route';
import type { Session } from './resolve-session';

export type AuthRedirect = {
  readonly url: URL;
  /** Account bounces never carried frame headers; kept as-is. */
  readonly framed: boolean;
};

const matchesRoute = (pathname: string, routes: readonly string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

/** The route path without the academy slug prefix, used for auth decisions. */
export function routePathname(route: AcademyRoute): string {
  if (!route.slugFromPath) return route.requestUrl.pathname;
  return `/${route.pathnameSegments.slice(1).join('/')}`.replace(/\/+$/, '') || '/';
}

export function authRedirect(route: AcademyRoute, session: Session): AuthRedirect | null {
  const { requestUrl, slugFromPath } = route;
  const pathname = routePathname(route);
  const prefix = slugFromPath ? `/${slugFromPath}` : '';

  if (session.isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const url = new URL(prefix || '/', requestUrl.origin);
    url.searchParams.delete('redirect');
    return { url, framed: true };
  }

  // Skipped when the refresh was unavailable: a backend blip must not log anyone out.
  const needsLogin =
    !session.isAuthenticated &&
    !session.refreshUnavailable &&
    matchesRoute(pathname, protectedRoutes) &&
    !matchesRoute(pathname, publicRoutes);
  if (needsLogin) {
    const url = new URL(`${prefix}/auth/login`, requestUrl.origin);
    url.searchParams.set('redirect', requestUrl.pathname + requestUrl.search);
    return { url, framed: true };
  }

  // Bare /account is only an entry point: bounce instead of rendering its layout.
  if (pathname === '/account') {
    const url = new URL(
      `${prefix}${accountIndexPath(requestUrl.searchParams.get('tab'))}`,
      requestUrl.origin,
    );
    return { url, framed: false };
  }
  return null;
}
