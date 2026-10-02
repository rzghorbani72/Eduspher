import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '../../env';
import {
  ACADEMY_ID_COOKIE,
  ACADEMY_NAME_COOKIE,
  ACADEMY_NOT_FOUND_PATH,
  ACADEMY_SLUG_COOKIE,
  DEFAULT_ACADEMY_SLUG,
  PLATFORM_PATHS,
  RESERVED_PATH_SEGMENTS,
  extractCandidateSlug,
  extractHost,
  extractSubdomainSlug,
  fetchStores,
  matchStore,
  matchStoreByCustomHost,
} from '../proxy-helpers';
import type { PublicStore } from '../proxy-helpers';

export const ACADEMY_COOKIES = [ACADEMY_ID_COOKIE, ACADEMY_SLUG_COOKIE, ACADEMY_NAME_COOKIE];

/** Everything the later steps need to know about which academy this request is for. */
export type AcademyRoute = {
  readonly requestUrl: NextRequest['nextUrl'];
  readonly pathnameSegments: readonly string[];
  readonly subdomainSlug: string | null;
  readonly searchParamSlug: string | null;
  readonly slugFromPath: string | null;
  /** Mentoma subdomain or custom domain: the host names the academy. */
  readonly isHostBound: boolean;
  readonly isAcademyHomePath: boolean;
  readonly isPanelRoot: boolean;
  readonly hasPathAcademy: boolean;
  readonly existingId: string | null;
  readonly existingSlug: string | null;
  readonly existingName: string | null;
  readonly stores: PublicStore[] | null;
  readonly matchedStore: PublicStore | null;
};

export type RouteResolution =
  | { readonly kind: 'route'; readonly route: AcademyRoute }
  | { readonly kind: 'response'; readonly response: NextResponse };

type MatchInput = {
  readonly hostHeader: string | null;
  readonly subdomainSlug: string | null;
  readonly pathAcademySlug: string | null;
  readonly numericSlugId: string | null;
  readonly candidateSlug: string | null;
  readonly existingId: string | null;
  readonly isHostBound: boolean;
  readonly isPanelRoot: boolean;
};

/** Most specific hint wins: subdomain, then path/query slug, then id, then fallbacks. */
function matchAcademy(stores: PublicStore[], input: MatchInput): PublicStore | null {
  const host = input.hostHeader ?? undefined;
  const allowCookieFallback = !input.isHostBound && !input.pathAcademySlug && !input.isPanelRoot;
  return (
    (input.subdomainSlug ? matchStore(stores, { slug: input.subdomainSlug, host }) : null) ??
    (input.pathAcademySlug ? matchStore(stores, { slug: input.pathAcademySlug, host }) : null) ??
    (input.numericSlugId ? matchStore(stores, { id: input.numericSlugId }) : null) ??
    (!input.isPanelRoot
      ? matchStore(stores, {
          slug: input.candidateSlug,
          host,
          id: input.numericSlugId ?? undefined,
        })
      : null) ??
    (allowCookieFallback && input.existingId
      ? matchStore(stores, { id: input.existingId })
      : null) ??
    null
  );
}

/**
 * A host-bound name maps to one academy and nothing else — never fall through
 * to the platform landing under a tenant's brand host.
 */
function unknownHostResponse(requestUrl: NextRequest['nextUrl'], backendReachable: boolean) {
  if (!backendReachable) {
    // An outage, not a missing academy: a 404 would tell search engines it is gone.
    return new NextResponse(null, { status: 503, headers: { 'Retry-After': '30' } });
  }
  const notFoundUrl = requestUrl.clone();
  notFoundUrl.pathname = ACADEMY_NOT_FOUND_PATH;
  notFoundUrl.search = '';
  const response = NextResponse.rewrite(notFoundUrl);
  // Never render an earlier host's academy brand on this hostname.
  for (const name of ACADEMY_COOKIES) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}

function isNumeric(value: string | null): value is string {
  return Boolean(value && /^\d+$/.test(value));
}

export async function resolveAcademyRoute(request: NextRequest): Promise<RouteResolution> {
  const requestUrl = request.nextUrl;
  const pathnameSegments = requestUrl.pathname.split('/').filter(Boolean);
  const firstSegment = pathnameSegments[0] ?? null;
  const searchParamSlug = requestUrl.searchParams.get('academy');
  const hostHeader = extractHost(request.headers.get('host'));
  const subdomainSlug = extractSubdomainSlug(hostHeader);
  const existingId = request.cookies.get(ACADEMY_ID_COOKIE)?.value ?? null;
  const nameCookie = request.cookies.get(ACADEMY_NAME_COOKIE)?.value ?? null;
  const pathSlugCandidate =
    firstSegment && !RESERVED_PATH_SEGMENTS.has(firstSegment) ? firstSegment : null;

  const stores = await fetchStores({
    host: hostHeader,
    slugs: [
      searchParamSlug,
      pathSlugCandidate,
      subdomainSlug,
      extractCandidateSlug(hostHeader),
      DEFAULT_ACADEMY_SLUG,
    ],
    ids: [
      isNumeric(firstSegment) ? firstSegment : null,
      existingId,
      env.defaultAcademyId ? String(env.defaultAcademyId) : null,
    ],
  });
  const customDomainStore = stores ? matchStoreByCustomHost(stores, hostHeader) : null;
  const isHostBound = Boolean(subdomainSlug) || Boolean(customDomainStore);
  // On host-bound requests the first path segment is a real route, never a slug.
  const slugFromPath = isHostBound ? null : pathSlugCandidate;
  const pathAcademySlug = searchParamSlug ?? slugFromPath;
  const isPanelRoot = !isHostBound && !pathAcademySlug && PLATFORM_PATHS.has(requestUrl.pathname);

  const matchedStore =
    customDomainStore ??
    (stores
      ? matchAcademy(stores, {
          hostHeader,
          subdomainSlug,
          pathAcademySlug,
          numericSlugId: isNumeric(slugFromPath) ? slugFromPath : null,
          candidateSlug:
            pathAcademySlug ??
            subdomainSlug ??
            extractCandidateSlug(hostHeader) ??
            DEFAULT_ACADEMY_SLUG,
          existingId,
          isHostBound,
          isPanelRoot,
        })
      : null);

  if (isHostBound && !matchedStore) {
    return { kind: 'response', response: unknownHostResponse(requestUrl, Boolean(stores)) };
  }

  return {
    kind: 'route',
    route: {
      requestUrl,
      pathnameSegments,
      subdomainSlug,
      searchParamSlug,
      slugFromPath,
      isHostBound,
      isAcademyHomePath: Boolean(slugFromPath) && pathnameSegments.length === 1,
      isPanelRoot,
      hasPathAcademy: Boolean(pathAcademySlug),
      existingId,
      existingSlug: request.cookies.get(ACADEMY_SLUG_COOKIE)?.value ?? null,
      existingName: nameCookie ? decodeURIComponent(nameCookie) : null,
      stores,
      matchedStore,
    },
  };
}
