export {
  jwtSecretWarningLogged,
  getAdminFrameAncestors,
  getMarketingFrameAncestors,
  shouldApplyPreviewEmbed,
  applyPreviewEmbedRequest,
  applyFrameAncestors,
  applyPreviewEmbedResponse,
  verifyJWT,
} from './parts/embed-and-jwt';
export {
  BACKEND_ORIGIN,
  BACKEND_API_PATH,
  DEFAULT_ACADEMY_SLUG,
  ACADEMY_ID_COOKIE,
  ACADEMY_SLUG_COOKIE,
  ACADEMY_NAME_COOKIE,
  ACADEMY_HEADER_ID,
  ACADEMY_HEADER_SLUG,
  ACADEMY_NOT_FOUND_PATH,
  isBackendProxyPath,
  STATIC_FILE,
  shouldBypass,
  RESERVED_PATH_SEGMENTS,
  PLATFORM_PATHS,
  protectedRoutes,
  publicRoutes,
  extractHost,
  extractCandidateSlug,
  BASE_DOMAIN,
  RESERVED_SUBDOMAINS,
  extractSubdomainSlug,
} from './parts/routing-config';
export type { PublicStore } from './parts/routing-config';
export {
  matchStore,
  matchStoreByCustomHost,
  fetchStores,
  readSetCookieValue,
  withCookie,
  refreshSession,
} from './parts/stores-and-session';
export type { RefreshOutcome } from './parts/stores-and-session';
