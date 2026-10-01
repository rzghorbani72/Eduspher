import 'server-only';

import { cookies, headers as nextHeaders } from 'next/headers';
import { getBackendApiBaseUrl, env } from '@/lib/env';
import { DEFAULT_LANGUAGE } from '@/lib/i18n/config';
import type { ApiEnvelope } from '@/lib/api/types';

/**
 * Custom error class for 401 Unauthorized errors
 * Used to trigger redirects to login in protected routes
 */
export class UnauthorizedError extends Error {
  status: number;
  redirectTo: string;

  constructor(message: string, redirectTo: string = '/auth/login') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
    this.redirectTo = redirectTo;
  }
}

/**
 * The backend's global LegalConsentGuard 403s every authenticated request once a
 * new TERMS/PRIVACY version is published. That is "signed in but blocked", not
 * "signed out" — treating it as the latter bounces the visitor to login, which
 * the edge then bounces back, so it must stay distinguishable.
 */
export class LegalConsentRequiredError extends Error {
  status = 403;
  code = 'LEGAL_CONSENT_REQUIRED';

  constructor() {
    super('Legal consent required');
    this.name = 'LegalConsentRequiredError';
  }
}

export const isLegalConsentError = (error: unknown): boolean =>
  error instanceof LegalConsentRequiredError;

export const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof UnauthorizedError) return true;
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status?: number }).status === 401;
  }
  return error instanceof Error && /401/.test(error.message);
};

type FetchOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  includeAuth?: boolean;
  /** Seconds to reuse a cached response. Public (`includeAuth: false`) calls only. */
  revalidate?: number;
  /**
   * Cache tags, automatically prefixed with the academy scope. Nothing purges
   * by tag yet — entries expire on the TTL — but tagging now means a future
   * purge endpoint cannot accidentally clear another academy's cache.
   */
  tags?: string[];
};

/** Public data is shared by every visitor, so a short window is safe and cheap. */
export const PUBLIC_REVALIDATE_SECONDS = 60;

const buildUrl = (path: string, query?: FetchOptions['query'], lang: string = DEFAULT_LANGUAGE) => {
  const cleanedPath = path.replace(/^\//, '');
  const baseRoot = getBackendApiBaseUrl(lang);
  const base = baseRoot.endsWith('/') ? baseRoot : `${baseRoot}/`;
  const url = new URL(cleanedPath, base);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const buildHeaders = async (
  includeAuth: boolean,
  initHeaders?: HeadersInit,
): Promise<HeadersInit> => {
  const headers = new Headers(initHeaders);
  const headerStore = await nextHeaders();
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const cookieStore = await cookies();
  const headerAcademyId =
    headerStore?.get?.('x-academy-id') ?? headerStore?.get?.('X-Academy-ID') ?? null;
  const headerAcademySlug =
    headerStore?.get?.('x-academy-slug') ?? headerStore?.get?.('X-Academy-Slug') ?? null;
  const cookieAcademyId = cookieStore.get(env.academyIdCookie)?.value;
  const cookieAcademySlug = cookieStore.get(env.academySlugCookie)?.value;
  const resolvedAcademySlug =
    headerAcademySlug ?? cookieAcademySlug ?? env.defaultAcademySlug ?? null;
  const resolvedAcademyId =
    headerAcademyId ??
    cookieAcademyId ??
    (resolvedAcademySlug ? null : env.defaultAcademyId ? String(env.defaultAcademyId) : null);
  if (resolvedAcademyId && !headers.has('X-Academy-ID')) {
    headers.set('X-Academy-ID', resolvedAcademyId);
  }
  if (resolvedAcademySlug && !headers.has('X-Academy-Slug')) {
    headers.set('X-Academy-Slug', resolvedAcademySlug);
  }
  const proto =
    headerStore?.get?.('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const forwardedHost =
    headerStore?.get?.('x-forwarded-host') ?? headerStore?.get?.('host') ?? null;
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? null;
  const isInternalHost = (host: string) => {
    const hostname = host.split(':')[0];
    return (
      /^(10\.|192\.168\.|127\.)/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      hostname.includes('.svc') ||
      hostname.includes('.cluster.local')
    );
  };
  if (!headers.has('Referer')) {
    if (forwardedHost && !isInternalHost(forwardedHost)) {
      headers.set('Referer', `${proto}://${forwardedHost}`);
    } else if (publicAppUrl) {
      headers.set('Referer', publicAppUrl);
    }
  }
  // Do not set Origin on server-side fetch — in K8s, Host can be a pod IP and breaks API CORS.
  if (includeAuth) {
    const token = cookieStore.get('jwt')?.value;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return headers;
};

const baseFetch = async (
  path: string,
  { query, includeAuth = true, revalidate, tags, ...init }: FetchOptions = {},
) => {
  const cookieStore = await cookies();
  const lang = cookieStore.get('preferred_language')?.value ?? DEFAULT_LANGUAGE;
  const url = buildUrl(path, query, lang);
  const headers = await buildHeaders(includeAuth, init.headers);

  // SECURITY: only anonymous GETs may enter Next's shared data cache. Anything
  // carrying a JWT is per-user, so it stays no-store — caching it could serve
  // one visitor's data to another.
  //
  // Academy scope rides in the X-Academy-ID / X-Academy-Slug headers, and Next
  // hashes the request headers into the fetch cache key, so two academies can
  // never collide on one entry. Tags are additionally academy-scoped below so a
  // mutation in one academy cannot revalidate another's cache.
  // `revalidate: 0` is an explicit opt-out: a caller uses it for anonymous GETs
  // whose answer is per-request work-in-progress (the site-builder draft
  // preview), where a cached response would hide the edit that was just made.
  const method = (init.method ?? 'GET').toUpperCase();
  const isCacheable = includeAuth === false && method === 'GET' && revalidate !== 0;
  const scopeHeaders = new Headers(headers);
  const academyTagScope =
    scopeHeaders.get('X-Academy-Slug') ?? scopeHeaders.get('X-Academy-ID') ?? 'global';
  const cacheOptions: Pick<RequestInit, 'cache' | 'next'> = isCacheable
    ? {
        next: {
          revalidate: revalidate ?? PUBLIC_REVALIDATE_SECONDS,
          ...(tags ? { tags: tags.map((tag) => `${academyTagScope}:${tag}`) } : {}),
        },
      }
    : { cache: 'no-store', next: { revalidate: 0 } };
  // Only uncached calls get a correlation id — headers are part of Next's fetch cache key.
  if (!isCacheable && !scopeHeaders.has('X-Request-Id')) {
    scopeHeaders.set('X-Request-Id', crypto.randomUUID());
  }

  const response = await fetch(url, {
    ...init,
    headers: scopeHeaders,
    credentials: 'include',
    ...cacheOptions,
  });

  if (!response.ok) {
    // Handle 401 specifically - only throw UnauthorizedError for account/profile endpoints
    // Other endpoints (theme, template, courses, etc.) should fail gracefully
    if (response.status === 401) {
      // Check if this is an account/profile-related endpoint
      const isAccountOrProfileEndpoint =
        path.includes('/auth/me') ||
        path.includes('/auth/profiles') ||
        path.includes('/enrollments') ||
        path.includes('/account');

      if (isAccountOrProfileEndpoint) {
        // Get store context to build proper login path
        const cookieStore = await cookies();
        const headerStore = await nextHeaders();
        const cookieAcademySlug = cookieStore.get(env.academySlugCookie)?.value;
        const headerAcademySlug = headerStore?.get?.('x-academy-slug') ?? null;
        const isSubdomain = headerStore?.get?.('x-academy-subdomain') === '1';
        const storeSlug = headerAcademySlug ?? cookieAcademySlug ?? env.defaultAcademySlug ?? null;

        // In subdomain mode the slug is already in the hostname — paths must be bare
        const loginPath = !isSubdomain && storeSlug ? `/${storeSlug}/auth/login` : '/auth/login';

        throw new UnauthorizedError(`Unauthorized (401): ${response.statusText}`, loginPath);
      }
      // For non-account/profile endpoints, just throw a regular error (no redirect)
    }

    // Try to extract error message from response body
    let errorMessage = `${response.status} ${response.statusText}`;
    let errorCode: string | null = null;
    try {
      const contentType = response.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          if (typeof errorData === 'object' && errorData !== null) {
            if ('code' in errorData && typeof errorData.code === 'string') {
              errorCode = errorData.code;
            }
            if ('message' in errorData && typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if ('error' in errorData) {
              if (typeof errorData.error === 'string') {
                errorMessage = errorData.error;
              } else if (typeof errorData.error === 'object' && errorData.error !== null) {
                const errorObj = errorData.error as { message?: string };
                if (errorObj.message) {
                  errorMessage = errorObj.message;
                }
              }
            }
          }
        }
      }
    } catch {
      // If parsing fails, use default message
    }

    if (errorCode === 'LEGAL_CONSENT_REQUIRED') {
      throw new LegalConsentRequiredError();
    }

    const message = `API request failed: ${errorMessage}`;
    const error = new Error(message);
    const enriched = error as Error & { status?: number; code?: string };
    enriched.status = response.status;
    if (errorCode) enriched.code = errorCode;
    throw error;
  }

  return response;
};

export async function serverFetch<T>(path: string, config?: FetchOptions): Promise<ApiEnvelope<T>> {
  const response = await baseFetch(path, config);
  return response.json();
}

export const serverFetchRaw = async <T>(path: string, config?: FetchOptions): Promise<T> => {
  const response = await baseFetch(path, config);
  return response.json() as Promise<T>;
};
