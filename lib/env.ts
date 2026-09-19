import { langApiVersionPath, normalizeApiLang } from './api-lang';

const normalizeBaseUrl = (origin: string) => {
  const trimmed = origin.trim().replace(/\/+$/, '');
  return trimmed.length ? trimmed : 'http://localhost:3000';
};

const normalizeApiPath = (path: string) => {
  if (!path) return '/v1';
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

// Academy ids are cuids, never numbers: Number(cuid) is NaN, which used to be
// sent as the academy_id "NaN" and rejected by the API.
const defaultAcademyId = process.env.NEXT_PUBLIC_DEFAULT_ACADEMY_ID?.trim() || null;
const defaultAcademySlug = process.env.NEXT_PUBLIC_DEFAULT_ACADEMY_SLUG ?? null;
const academyIdCookie = process.env.NEXT_PUBLIC_ACADEMY_ID_COOKIE ?? 'academy_id';
const academySlugCookie = process.env.NEXT_PUBLIC_ACADEMY_SLUG_COOKIE ?? 'academy_slug';
const academyNameCookie = process.env.NEXT_PUBLIC_ACADEMY_NAME_COOKIE ?? 'academy_name';

const adminPanelOrigin = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ?? 'http://localhost:4000',
);

export const env = {
  backendOrigin: normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? ''),
  /** Bare /v1 path — prefer getBackendApiBaseUrl(lang) for requests. */
  backendApiPath: normalizeApiPath(process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? '/v1'),
  adminPanelOrigin,
  defaultAcademyId,
  defaultAcademySlug,
  academyIdCookie,
  academySlugCookie,
  academyNameCookie,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'منتوما',
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'منتوما پلتفرم ساخت وبسایت و آکادمی آموزشی — دورهٔ ضبط‌شده، کلاس آنلاین (زنده)، ثبت‌نام و پرداخت دانشجو، همه از یک سایت اختصاصی.',
  appUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5000'),
  irDomain: normalizeBaseUrl(process.env.NEXT_PUBLIC_IR_DOMAIN ?? 'https://mentoma.ir'),
  comDomain: normalizeBaseUrl(process.env.NEXT_PUBLIC_COM_DOMAIN ?? 'https://mentoma.com'),
  appRegion: (process.env.NEXT_PUBLIC_APP_REGION === 'EU' ? 'EU' : 'IR') as 'IR' | 'EU',
};

/** Absolute backend API root including path language, e.g. https://api…/fa/v1 */
export function getBackendApiBaseUrl(lang?: string | null): string {
  const versionPath = langApiVersionPath(lang);
  const configured = normalizeApiPath(process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? '/v1');
  const path =
    configured === '/v1' || configured.endsWith('/v1')
      ? versionPath
      : configured.replace(/\/v1\/?$/, versionPath);
  return `${env.backendOrigin}${path}`;
}

function readClientPreferredLanguage(): string {
  if (typeof window === 'undefined') return 'fa';
  return window.localStorage.getItem('preferred_language') || 'fa';
}

/**
 * Client-side base URL — deliberately SAME-ORIGIN (e.g. "/fa/v1"), proxied to the
 * backend by the rewrite in next.config.ts.
 *
 * Calling the backend origin directly would set the auth cookies on that host
 * (they are host-only), so an academy served on its own hostname —
 * `mehr.localhost:5000` in dev, `mehr.example.com` in production — would never
 * send them back on its own page requests. The Next server would then read no
 * session and bounce every /account route to login. Going through our own
 * origin keeps `jwt` / `refresh_token` / `csrf-token` on the academy host.
 */
export function getClientBackendApiBaseUrl(): string {
  return langApiVersionPath(readClientPreferredLanguage());
}

/** @deprecated Prefer getBackendApiBaseUrl(lang) — defaults to fa. */
export const backendApiBaseUrl = getBackendApiBaseUrl('fa');

export { normalizeApiLang, langApiVersionPath };
