'use client';

import { toast } from 'react-toastify';

import {
  classifyApiError,
  fallbackErrorKey,
  parseApiError,
  parseThrownApiError,
  type ParsedApiError,
} from '@/lib/api/api-error';
import { env } from '@/lib/env';
import { t as translate, DEFAULT_LANGUAGE, type LanguageCode } from '@/lib/i18n';

type NotifyOptions = {
  /** Prefer this when the caller already knows the academy login URL. */
  loginHref?: string;
  /** Skip toast for kinds the caller handles itself (e.g. legal gate). */
  silentKinds?: ReadonlyArray<ReturnType<typeof classifyApiError>>;
};

export function readLanguage(): LanguageCode {
  if (typeof document === 'undefined') return DEFAULT_LANGUAGE;
  const match = document.cookie.match(/(?:^|; )preferred_language=([^;]*)/);
  const raw = match ? decodeURIComponent(match[1]).toLowerCase() : '';
  if (raw === 'fa' || raw === 'en' || raw === 'ar' || raw === 'tr') return raw;
  return DEFAULT_LANGUAGE;
}

function t(key: string): string {
  return translate(key, readLanguage());
}

function readAcademySlug(): string | null {
  if (typeof document === 'undefined') return null;
  const name = env.academySlugCookie;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]).trim() : '';
  return value || null;
}

/** Path-mode academies need `/{slug}/auth/login`; subdomain hosts use bare `/auth/login`. */
export function resolveStorefrontLoginHref(redirectTo?: string): string {
  if (typeof window === 'undefined') return '/auth/login';
  const host = window.location.hostname.toLowerCase();
  const labels = host.split('.');
  const isLikelySubdomain =
    labels.length >= 3 || (labels.length === 2 && labels[1] === 'localhost');
  const reserved = new Set(['www', 'api', 'dashboard', 'panel', 'app']);
  const onAcademySubdomain = isLikelySubdomain && !reserved.has(labels[0] ?? '');

  const path = onAcademySubdomain
    ? '/auth/login'
    : (() => {
        const slug = readAcademySlug();
        return slug ? `/${slug}/auth/login` : '/auth/login';
      })();

  const target = redirectTo ?? `${window.location.pathname}${window.location.search}`;
  if (!target || target.includes('/auth/login')) return path;
  return `${path}?redirect=${encodeURIComponent(target)}`;
}

function displayMessage(error: ParsedApiError): string {
  const kind = classifyApiError(error);
  if (error.message.trim()) return error.message;
  return t(fallbackErrorKey(kind));
}

function toastLoginRequired(loginHref: string, message: string): void {
  toast.error(
    ({ closeToast }) => (
      <div className="flex flex-col gap-2 text-start">
        <p className="m-0 text-[15px] leading-relaxed">{message}</p>
        <button
          type="button"
          className="self-start rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
          onClick={() => {
            closeToast?.();
            window.location.assign(loginHref);
          }}
        >
          {t('auth.goToLogin')}
        </button>
      </div>
    ),
    {
      toastId: 'api-login-required',
      autoClose: 8000,
      closeOnClick: false,
    },
  );
}

/**
 * One snackbar path for Nest (and BFF-forwarded) errors on the storefront.
 * 401 → message + "Go to login"; other common codes get a clear fallback when
 * the body has no usable `message`.
 */
export function notifyApiError(
  input: ParsedApiError | { status: number; body?: unknown } | unknown,
  options: NotifyOptions = {},
): ReturnType<typeof classifyApiError> {
  let error: ParsedApiError | null = null;

  if (
    input &&
    typeof input === 'object' &&
    'status' in input &&
    typeof (input as { status: unknown }).status === 'number' &&
    'code' in input
  ) {
    error = input as ParsedApiError;
  } else if (
    input &&
    typeof input === 'object' &&
    'status' in input &&
    typeof (input as { status: unknown }).status === 'number' &&
    'body' in input
  ) {
    const row = input as { status: number; body?: unknown };
    error = parseApiError(row.status, row.body);
  } else {
    error = parseThrownApiError(input);
  }

  if (!error) {
    toast.error(t('errors.generic'), { toastId: 'api-generic' });
    return 'generic';
  }

  const kind = classifyApiError(error);
  if (options.silentKinds?.includes(kind)) return kind;

  const message = displayMessage(error);

  if (kind === 'login_required') {
    const href = options.loginHref ?? resolveStorefrontLoginHref();
    toastLoginRequired(href, message || t('errors.loginRequired'));
    return kind;
  }

  if (kind === 'legal_consent') {
    return kind;
  }

  toast.error(message, {
    toastId: `api-${kind}-${error.code}`,
  });
  return kind;
}

/** Toast + navigate after a short beat so the snackbar is readable. */
export function notifyLoginRequiredAndRedirect(loginHref?: string): void {
  const href = loginHref ?? resolveStorefrontLoginHref();
  toastLoginRequired(href, t('errors.loginRequired'));
  window.setTimeout(() => {
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.assign(href);
    }
  }, 1600);
}
