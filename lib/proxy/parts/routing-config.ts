import type { NextRequest } from 'next/server';

export const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? 'http://localhost:3000';

export const BACKEND_API_PATH = process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? '/api';

export const DEFAULT_ACADEMY_SLUG = process.env.NEXT_PUBLIC_DEFAULT_ACADEMY_SLUG ?? null;

export const ACADEMY_ID_COOKIE = process.env.NEXT_PUBLIC_ACADEMY_ID_COOKIE ?? 'academy_id';

export const ACADEMY_SLUG_COOKIE = process.env.NEXT_PUBLIC_ACADEMY_SLUG_COOKIE ?? 'academy_slug';

export const ACADEMY_NAME_COOKIE = process.env.NEXT_PUBLIC_ACADEMY_NAME_COOKIE ?? 'academy_name';

export const ACADEMY_HEADER_ID = 'x-academy-id';

export const ACADEMY_HEADER_SLUG = 'x-academy-slug';

export const ACADEMY_NOT_FOUND_PATH = '/academy-not-found';

export type PublicStore = {
  id: number;
  name: string;
  slug?: string | null;
  domain?: {
    public_address?: string | null;
    private_address?: string | null;
  } | null;
};

export const isBackendProxyPath = (pathname: string) =>
  /^\/(?:(?:fa|en|ar|tr)\/)?v1(?:\/|$)/.test(pathname);

/**
 * Static assets under /public. A missing extension here is not cosmetic: the
 * request falls through to the academy-slug rewrite and 404s, so any new asset
 * type must be listed.
 */
export const STATIC_FILE =
  /\.(?:txt|xml|json|js|mjs|css|map|ico|png|jpe?g|gif|svg|webp|avif|mp4|webm|mp3|pdf|woff2?|ttf|otf)$/i;

export const shouldBypass = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  // sitemap.xml must run through proxy so academy hosts get tenant headers
  // for a correct per-academy sitemap.
  if (pathname === '/sitemap.xml' || pathname.startsWith('/sitemap')) {
    return false;
  }
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    isBackendProxyPath(pathname) ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    STATIC_FILE.test(pathname)
  );
};

export const RESERVED_PATH_SEGMENTS = new Set([
  '',
  'api',
  'auth',
  'images',
  'static',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'academy-not-found',
  // Academy-scoped routes — never treat these as an academy slug prefix.
  // Missing one here breaks custom domains: /classes/join/:code was rewritten
  // to /join/:code because "classes" looked like a path-based academy slug.
  'account',
  'blog',
  'bundles',
  'certificates',
  'checkout',
  'classes',
  'courses',
  'learn',
  'payment',
  'preview',
  'roadmap',
  'e2e-fixtures',
  // Platform-only routes — must not be shadowed by an academy slug
  'about',
  'academies',
  'career',
  'contact',
  'pricing',
  'privacy',
  'refund',
  'terms',
]);

// Paths that belong to the platform itself, not any academy.
// Middleware sets x-panel-root: 1 for these so the layout renders platform chrome.
export const PLATFORM_PATHS = new Set([
  '/',
  '',
  '/about',
  '/academies',
  '/blog',
  '/career',
  '/contact',
  '/courses',
  '/pricing',
  '/privacy',
  '/refund',
  '/terms',
]);

// Define protected routes that require authentication
export const protectedRoutes = ['/account', '/learn'];

// Define public routes that don't require authentication
export const publicRoutes = [
  '/',
  '/courses',
  '/blog',
  '/about',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export const extractHost = (hostHeader?: string | null) => {
  if (!hostHeader) return null;
  return hostHeader.split(':')[0];
};

export const extractCandidateSlug = (host?: string | null) => {
  if (!host) return null;
  if (host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  const parts = host.split('.');
  if (parts.length <= 1) {
    return host;
  }
  const [firstPart] = parts;
  if (firstPart === 'www') {
    return parts[1] ?? null;
  }
  return firstPart;
};

export const BASE_DOMAIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost').hostname;
  } catch {
    return 'localhost';
  }
})();

// Infrastructure hosts that are never an academy — they must keep serving the
// platform instead of being resolved as a tenant slug.
export const RESERVED_SUBDOMAINS = new Set([
  'www',
  'admin',
  'panel',
  'api',
  'app',
  'auth',
  'cdn',
  'static',
  'assets',
  'media',
  'files',
  'mail',
  'smtp',
  'blog',
  'docs',
  'status',
  'support',
  'dev',
  'staging',
  'test',
]);

export const extractSubdomainSlug = (hostname: string | null): string | null => {
  if (!hostname) return null;
  if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) return null;
  if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
    const sub = hostname.slice(0, hostname.length - BASE_DOMAIN.length - 1);
    if (sub && !RESERVED_SUBDOMAINS.has(sub.toLowerCase())) return sub;
  }
  return null;
};
