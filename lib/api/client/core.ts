'use client';

import { notifyLoginRequiredAndRedirect } from '@/lib/api/notify-api-error';
import { getClientBackendApiBaseUrl, env } from '@/lib/env';
import { assertNoRequestStorm } from '@/lib/api/request-storm';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

const withTrailingSlash = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value);

const getBaseUrl = () => withTrailingSlash(getClientBackendApiBaseUrl());

export const apiFetch = (path: string, init: RequestInit): Promise<Response> => {
  assertNoRequestStorm(init.method ?? 'GET', path, !isPreSessionAuthPath(path));
  return fetch(`${getBaseUrl()}${path}`, init);
};

export type RequestOptions = {
  signal?: AbortSignal;
  skipRefresh?: boolean; // Skip token refresh for this request
};

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Which academy this browser is on: the cookie the tenant middleware set, then
 * the build-time default. Every tenant-scoped call must go through this — a
 * second, hand-rolled copy is how one flow ends up on a different academy.
 *
 * Empty string counts as missing: panel-root clears academy cookies with
 * `value=""` / maxAge 0, and `??` would otherwise keep "" and break headers.
 */
export const resolveAcademyId = (): string | null => {
  const fromCookie = getCookieValue(env.academyIdCookie)?.trim();
  if (fromCookie) return fromCookie;
  return env.defaultAcademyId;
};

export const getAcademyId = (): string => {
  const academyId = resolveAcademyId();
  if (academyId) {
    return academyId;
  }
  throw new Error('Academy ID is required but not found in cookies or environment variables');
};

const getAcademySlug = (): string | null => {
  const slug = getCookieValue(env.academySlugCookie)?.trim();
  return slug || null;
};

let csrfBootstrap: Promise<string | null> | null = null;

/** Quietly mint a csrf-token cookie for fresh / private windows. */
export async function ensureCsrfToken(force = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!force) {
    const existing = getCookieValue('csrf-token');
    if (existing) return existing;
  }
  if (csrfBootstrap) return csrfBootstrap;

  csrfBootstrap = (async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) return getCookieValue('csrf-token');
      const data = (await response.json().catch(() => null)) as {
        csrf_token?: string;
      } | null;
      return data?.csrf_token ?? getCookieValue('csrf-token');
    } catch {
      return getCookieValue('csrf-token');
    } finally {
      csrfBootstrap = null;
    }
  })();

  return csrfBootstrap;
}

export const buildHeaders = async (
  additionalHeaders: HeadersInit = {},
  options?: { mutate?: boolean },
): Promise<HeadersInit> => {
  const headers = new Headers(additionalHeaders);
  const academyId = resolveAcademyId();
  if (academyId) {
    headers.set('X-Academy-ID', academyId);
  }

  const academySlug = getAcademySlug();
  if (academySlug) {
    headers.set('X-Academy-Slug', academySlug);
  }

  if (options?.mutate) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  } else {
    const csrfToken = getCookieValue('csrf-token');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  return headers;
};

// Token refresh state management
let isRefreshing = false;

let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token cookie
 */
async function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        logger.ok('Auth', 'TokenRefreshed');
        return true;
      }

      logger.warn('Auth', 'TokenRefreshRejected', { status_code: response.status });
      return false;
    } catch (error) {
      logger.error('Auth', 'TokenRefreshFailed', errorFields(error));
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Session is gone — snackbar with Go to login, then soft redirect.
 */
function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath.includes('/auth/login') || currentPath.includes('/login')) {
    return;
  }
  notifyLoginRequiredAndRedirect();
}

export const LEGAL_CONSENT_REQUIRED_CODE = 'LEGAL_CONSENT_REQUIRED';

export const LEGAL_CONSENT_REQUIRED_EVENT = 'mentoma:legal-consent-required';

export async function handleResponse<T>(
  response: Response,
  retryFn?: () => Promise<T>,
  skipRefresh?: boolean,
  retriedCsrf = false,
): Promise<T> {
  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');

  // Check if response is not in 2xx range
  if (!response.ok) {
    let errorMessage = response.statusText || 'Request failed';
    let errorCode: string | undefined;

    if (isJson) {
      try {
        const parsed = (await response.json()) as unknown;
        if (typeof parsed === 'object' && parsed !== null) {
          // The stable code is what callers branch on (e.g. CAPTCHA_REQUIRED);
          // the message is already translated and is only for display.
          if ('code' in parsed && typeof parsed.code === 'string') {
            errorCode = parsed.code;
          }
          // Try to extract error message from various possible fields
          if ('message' in parsed && typeof parsed.message === 'string') {
            errorMessage = parsed.message;
          } else if ('error' in parsed && typeof parsed.error === 'string') {
            errorMessage = parsed.error;
          } else if (
            'error' in parsed &&
            typeof parsed.error === 'object' &&
            parsed.error !== null
          ) {
            const errorObj = parsed.error as { message?: string };
            if (errorObj.message) {
              errorMessage = errorObj.message;
            }
          }
        }
      } catch {
        // If JSON parsing fails, use status text
      }
    } else {
      try {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      } catch {
        // If text parsing fails, use status text
      }
    }

    // Handle 401 - attempt token refresh
    if (response.status === 401 && !skipRefresh && retryFn) {
      logger.ok('Auth', 'AccessTokenExpired');
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        // Retry the original request
        return retryFn();
      }

      // Refresh failed - redirect to login
      redirectToLogin();
      return null as unknown as T;
    }

    // A 401 on a session-based call (retryFn set) means the session is gone, so
    // the visitor is sent to login. On a sign-in call there is no session yet —
    // 401 is "wrong credentials" and must throw, or the form treats the empty
    // result as a successful login and redirects with no session.
    // skipRefresh callers (public marketing / legal) must also throw, not
    // redirect — a stale cookie must not kill the landing signup.
    if (response.status === 401 && retryFn && !skipRefresh) {
      redirectToLogin();
      return null as unknown as T;
    }

    // A new terms/privacy version 403s every authenticated call. Announce it once
    // so the consent gate can open, instead of letting the whole account area
    // fail with an unexplained error.
    if (errorCode === LEGAL_CONSENT_REQUIRED_CODE && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LEGAL_CONSENT_REQUIRED_EVENT));
    }

    // Fresh tab / rotated cookie — mint CSRF once and retry without toasting.
    if (errorCode === 'CSRF_REQUIRED' && retryFn && !retriedCsrf) {
      await ensureCsrfToken(true);
      return retryFn();
    }

    throw Object.assign(new Error(errorMessage), {
      code: errorCode,
      status: response.status,
    });
  }

  // Response is successful (2xx), parse and return
  if (isJson) {
    const parsed = (await response.json()) as unknown;
    return parsed as T;
  }

  const text = await response.text();
  return text as unknown as T;
}

/**
 * Calls made before a session exists (or that end one). A 401 here means the
 * credentials/code were wrong — never "your session expired" — so these must
 * not trigger a token refresh or a redirect; the error has to reach the form.
 */
const PRE_SESSION_AUTH_PATHS = [
  '/auth/public/login',
  '/auth/staff/login',
  '/auth/admin/login',
  '/auth/public/identify',
  '/auth/register',
  '/auth/quick-signup',
  '/auth/refresh',
  '/auth/logout',
  '/auth/login-by-phone-otp',
  '/auth/login-by-email-otp',
  '/auth/confirm-phone',
  '/auth/set-new-password',
  '/auth/forget-password',
  '/auth/otp/',
] as const;

const isPreSessionAuthPath = (path: string): boolean =>
  PRE_SESSION_AUTH_PATHS.some((authPath) => path.includes(authPath));

export const postJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (skipRefresh = false, retriedCsrf = false): Promise<T> => {
    const headers = await buildHeaders(
      {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      { mutate: true },
    );

    const response = await apiFetch(path, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    const isAuthEndpoint = isPreSessionAuthPath(path);

    return handleResponse<T>(
      response,
      isAuthEndpoint ? undefined : () => makeRequest(true, true),
      skipRefresh || isAuthEndpoint,
      retriedCsrf,
    );
  };

  return makeRequest(options?.skipRefresh);
};
