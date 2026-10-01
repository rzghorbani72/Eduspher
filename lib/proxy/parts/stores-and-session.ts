import type { NextRequest } from 'next/server';
import { BACKEND_API_PATH, BACKEND_ORIGIN, BASE_DOMAIN } from './routing-config';
import type { PublicStore } from './routing-config';

export const matchStore = (
  stores: PublicStore[],
  options: { slug?: string | null; host?: string | null; id?: string | null },
) => {
  const targetSlug = options.slug?.toLowerCase();
  const host = options.host?.toLowerCase();
  const hostWithoutSubdomain = host?.replace(/^www\./, '');
  const targetId = options.id ? String(options.id) : null;

  return stores.find((store) => {
    if (targetId && String(store.id) === targetId) {
      return true;
    }
    const storeSlug = store.slug?.toLowerCase();
    if (targetSlug && storeSlug === targetSlug) {
      return true;
    }
    const privateAddress = store.domain?.private_address?.toLowerCase();
    const publicAddress = store.domain?.public_address?.toLowerCase()?.replace(/^www\./, '');
    if (
      host &&
      privateAddress &&
      (host === privateAddress || host.startsWith(`${privateAddress}.`))
    ) {
      return true;
    }
    if (hostWithoutSubdomain && publicAddress && hostWithoutSubdomain === publicAddress) {
      return true;
    }
    return false;
  });
};

/** Custom hostname the academy owns (not a Mentoma subdomain). */
export const matchStoreByCustomHost = (
  stores: PublicStore[],
  host: string | null,
): PublicStore | null => {
  if (!host) return null;
  const normalized = host.toLowerCase().replace(/^www\./, '');
  if (normalized === BASE_DOMAIN) return null;
  if (host.toLowerCase().endsWith(`.${BASE_DOMAIN}`)) return null;
  return (
    stores.find((store) => {
      const publicAddress = store.domain?.public_address?.toLowerCase()?.replace(/^www\./, '');
      return Boolean(publicAddress && normalized === publicAddress);
    }) ?? null
  );
};

export const fetchStores = async () => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}${BACKEND_API_PATH}/academies/public`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: PublicStore[] };
    return payload.data ?? null;
  } catch {
    return null;
  }
};

/**
 * The access token cookie lives ~5h while the refresh token lives ~7 days, so a
 * visitor coming back the next day still holds a valid session the server can
 * revive. Without this the expired `jwt` alone decided the answer and every
 * returning user was bounced to login after 5 hours.
 */
export type RefreshOutcome =
  | { status: 'refreshed'; jwt: string; setCookies: string[] }
  | { status: 'invalid' }
  | { status: 'unavailable' };

export const readSetCookieValue = (setCookies: string[], name: string): string | null => {
  const entry = setCookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!entry) return null;
  const value = entry.slice(name.length + 1).split(';')[0];
  return value.length > 0 ? value : null;
};

/** Rewrites one cookie in the request header so this render sees the new token. */
export const withCookie = (header: string | null, name: string, value: string) => {
  const others = (header ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !part.startsWith(`${name}=`));
  return [...others, `${name}=${value}`].join('; ');
};

export const refreshSession = async (request: NextRequest): Promise<RefreshOutcome> => {
  if (!request.cookies.get('refresh_token')?.value) {
    return { status: 'invalid' };
  }

  try {
    const csrfToken = request.cookies.get('csrf-token')?.value;
    const response = await fetch(`${BACKEND_ORIGIN}${BACKEND_API_PATH}/auth/refresh`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') ?? '',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
    });

    if (response.ok) {
      const setCookies = response.headers.getSetCookie();
      const jwt = readSetCookieValue(setCookies, 'jwt');
      return jwt ? { status: 'refreshed', jwt, setCookies } : { status: 'invalid' };
    }

    // Only an explicit rejection means the refresh token is dead. A 5xx or a
    // network blip must not log the visitor out.
    return response.status === 401 || response.status === 403
      ? { status: 'invalid' }
      : { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
};
