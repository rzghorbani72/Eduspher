import type { NextRequest, NextResponse } from 'next/server';
import { env } from '../../env';
import {
  ACADEMY_HEADER_ID,
  ACADEMY_HEADER_SLUG,
  ACADEMY_ID_COOKIE,
  ACADEMY_NAME_COOKIE,
  ACADEMY_SLUG_COOKIE,
  DEFAULT_ACADEMY_SLUG,
  applyFrameAncestors,
  applyPreviewEmbedRequest,
  applyPreviewEmbedResponse,
  matchStore,
  shouldApplyPreviewEmbed,
} from '../proxy-helpers';
import type { PublicStore } from '../proxy-helpers';
import type { AcademyRoute } from './resolve-academy-route';

type Cookie = { readonly name: string; readonly value: string };

export type AcademyRequest = {
  readonly requestHeaders: Headers;
  readonly academyCookies: readonly Cookie[];
  /** May differ from route.matchedStore when the default academy was applied. */
  readonly matchedStore: PublicStore | null;
  /** Frame-ancestors / preview-embed headers, the same for every response we return. */
  readonly frame: (response: NextResponse) => void;
};

function setRoutingHeaders(headers: Headers, route: AcademyRoute) {
  const { requestUrl } = route;
  headers.set('x-public-pathname', requestUrl.pathname);
  if (requestUrl.search) headers.set('x-public-search', requestUrl.search);
  // x-url-pathname is set after the rewrite decision, so the layout sees the effective path.
  if (route.isPanelRoot) {
    headers.set('x-panel-root', '1');
  } else if (route.isHostBound) {
    headers.set('x-academy-subdomain', '1');
    if (requestUrl.pathname === '/' || requestUrl.pathname === '') {
      headers.set('x-academy-home', '1');
    }
  } else if (route.slugFromPath) {
    headers.set('x-academy-from-path', '1');
    headers.set('x-academy-path-slug', route.slugFromPath);
    if (route.isAcademyHomePath) headers.set('x-academy-home', '1');
  }
}

function defaultAcademy(route: AcademyRoute): PublicStore | null {
  if (route.isPanelRoot || route.isHostBound || route.hasPathAcademy) return null;
  if (!DEFAULT_ACADEMY_SLUG || !route.stores) return null;
  return (
    matchStore(route.stores, {
      slug: DEFAULT_ACADEMY_SLUG,
      id: env.defaultAcademyId ? String(env.defaultAcademyId) : null,
    }) ?? null
  );
}

function storeCookies(store: PublicStore): Cookie[] {
  return [
    { name: ACADEMY_ID_COOKIE, value: String(store.id) },
    ...(store.slug ? [{ name: ACADEMY_SLUG_COOKIE, value: store.slug }] : []),
    { name: ACADEMY_NAME_COOKIE, value: encodeURIComponent(store.name ?? '') },
  ];
}

/** Picks the academy for this render and writes it to request headers and cookies. */
function assignAcademy(headers: Headers, route: AcademyRoute) {
  const usesCookieAcademy = !route.isPanelRoot && !route.hasPathAcademy && route.existingId;
  const store =
    route.matchedStore && !route.isPanelRoot
      ? route.matchedStore
      : usesCookieAcademy
        ? null
        : defaultAcademy(route);

  if (store) {
    headers.set(ACADEMY_HEADER_ID, String(store.id));
    if (store.slug) headers.set(ACADEMY_HEADER_SLUG, store.slug);
    return { matchedStore: store, cookies: storeCookies(store) };
  }
  if (usesCookieAcademy && route.existingId) {
    headers.set(ACADEMY_HEADER_ID, route.existingId);
    if (route.existingSlug) headers.set(ACADEMY_HEADER_SLUG, route.existingSlug);
  }
  const headerId = headers.get(ACADEMY_HEADER_ID);
  const nameFromList =
    headerId && route.stores ? matchStore(route.stores, { id: headerId })?.name : null;
  const name = route.matchedStore?.name ?? nameFromList ?? route.existingName ?? env.siteName;
  return {
    matchedStore: route.matchedStore,
    cookies: [{ name: ACADEMY_NAME_COOKIE, value: encodeURIComponent(name ?? env.siteName) }],
  };
}

export function prepareAcademyRequest(request: NextRequest, route: AcademyRoute): AcademyRequest {
  const requestHeaders = new Headers(request.headers);
  setRoutingHeaders(requestHeaders, route);
  const usePreviewEmbed = shouldApplyPreviewEmbed(request, route.isAcademyHomePath);
  const previewEmbed = usePreviewEmbed
    ? applyPreviewEmbedRequest(request, requestHeaders)
    : { preview: null, embed: false };
  const { matchedStore, cookies } = assignAcademy(requestHeaders, route);

  return {
    requestHeaders,
    academyCookies: cookies,
    matchedStore,
    frame: (response) => {
      if (usePreviewEmbed) {
        applyPreviewEmbedResponse(
          response,
          previewEmbed.preview,
          previewEmbed.embed,
          route.isAcademyHomePath,
        );
      } else {
        applyFrameAncestors(response, { embed: false, allowMarketing: false });
      }
    },
  };
}
