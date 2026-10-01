'use client';

import type { AuthResponse } from '@/lib/api/types';
import {
  apiFetch,
  buildHeaders,
  ensureCsrfToken,
  getAcademyId,
  handleResponse,
  postJson,
  resolveAcademyId,
} from './core';
import type { RequestOptions } from './core';

/**
 * GET/POST from platform pages with no tenant context (marketing root, contact
 * form, landing quick-signup). Skips X-Academy-ID — panel-root clears the
 * academy cookie and signup must not depend on a fake default academy id.
 */
export const getPublicJson = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const makeRequest = async (): Promise<T> => {
    const response = await apiFetch(path, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal: options?.signal,
      cache: 'no-store',
    });
    return handleResponse<T>(response, () => makeRequest(), true);
  };

  return makeRequest();
};

export const postPublicJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (retriedCsrf = false): Promise<T> => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);

    const response = await apiFetch(path, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    return handleResponse<T>(response, () => makeRequest(true), true, retriedCsrf);
  };

  return makeRequest();
};

export const getJson = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const makeRequest = async (skipRefresh = false, retriedCsrf = false): Promise<T> => {
    const headers = await buildHeaders({
      Accept: 'application/json',
    });

    const response = await apiFetch(path, {
      method: 'GET',
      credentials: 'include',
      headers,
      signal: options?.signal,
    });
    return handleResponse<T>(response, () => makeRequest(true, true), skipRefresh, retriedCsrf);
  };

  return makeRequest(options?.skipRefresh);
};

export const putJson = async <T>(
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
      method: 'PUT',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(response, () => makeRequest(true, true), skipRefresh, retriedCsrf);
  };

  return makeRequest(options?.skipRefresh);
};

export const patchJson = async <T>(
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
      method: 'PATCH',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(response, () => makeRequest(true, true), skipRefresh, retriedCsrf);
  };

  return makeRequest(options?.skipRefresh);
};

export const deleteJson = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const makeRequest = async (skipRefresh = false, retriedCsrf = false): Promise<T> => {
    const headers = await buildHeaders(
      {
        Accept: 'application/json',
      },
      { mutate: true },
    );

    const response = await apiFetch(path, {
      method: 'DELETE',
      credentials: 'include',
      headers,
      signal: options?.signal,
    });
    return handleResponse<T>(response, () => makeRequest(true, true), skipRefresh, retriedCsrf);
  };

  return makeRequest(options?.skipRefresh);
};

export type LoginPayload = {
  identifier: string;
  password: string;
  academy_id?: string;
  role?: string;
};

export const login = async (payload: LoginPayload, options?: RequestOptions) => {
  return postJson<AuthResponse>(
    '/auth/public/login',
    {
      ...payload,
      academy_id: payload.academy_id ?? getAcademyId(),
    },
    options,
  );
};

/** The stable backend error code carried by a failed request, if any. */
export const apiErrorCode = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined;

export type RegisterPayload = {
  name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirmed_password: string;
  role?: string;
  academy_id?: string;
  display_name: string;
  bio?: string;
  website?: string;
  location?: string;
};

export const register = async (payload: RegisterPayload, options?: RequestOptions) => {
  return postJson<AuthResponse>(
    '/auth/register',
    {
      role: 'USER',
      academy_id: resolveAcademyId() ?? undefined,
      ...payload,
    },
    options,
  );
};

export const logout = async (options?: RequestOptions) => {
  return postJson<AuthResponse>('/auth/logout', {}, options);
};

export const me = (options?: RequestOptions) => {
  return getJson<{ id?: string; status?: string; data?: unknown }>('/auth/me', options);
};

export type QuickSignupPayload = {
  phone_number: string;
  display_name: string;
  accepted_terms_version: string;
  accepted_privacy_version: string;
};

/**
 * Landing fast flow, after OTP: open a session for a new OR existing phone
 * (existing → login; new → register). No password — the OTP just verified IS
 * the credential. Then `quickStartAcademy` creates the academy.
 */
export const quickSignup = (payload: QuickSignupPayload, options?: RequestOptions) => {
  return postPublicJson<AuthResponse>('/auth/quick-signup', { ...payload }, options);
};

/**
 * Course-page enroll dialog, after OTP: join this academy as a student (new
 * phone) or sign in (already a member). No password — the OTP is the credential.
 */
export const quickJoin = (payload: QuickSignupPayload, options?: RequestOptions) => {
  return postPublicJson<AuthResponse>(
    '/auth/public/quick-join',
    { ...payload, academy_id: resolveAcademyId() ?? undefined },
    options,
  );
};

export type QuickStartResult = {
  data?: { id?: string; slug?: string };
  site_ready?: boolean;
  field?: string;
};

/** Landing fast flow, step 2: create the academy AND publish its website. */
export const quickStartAcademy = (
  payload: { name: string; private_domain: string },
  options?: RequestOptions,
) => {
  return postJson<QuickStartResult>('/academies/quick-start', { ...payload }, options);
};

/** Mint a 60s code so the panel origin can open the same session. */
export const createPanelHandoff = (options?: RequestOptions) => {
  return postJson<{ code?: string }>('/auth/panel-handoff', {}, options);
};

export const checkAcademySlug = (slug: string, options?: RequestOptions) => {
  return getPublicJson<{ available: boolean }>(
    `/academies/slug-available?slug=${encodeURIComponent(slug)}`,
    options,
  );
};

export type LegalDocumentSummary = {
  type: string;
  version: string;
  title: string;
  published_at: string | null;
};

/**
 * Public list of current legal docs. Platform marketing has no academy cookie
 * (panel-root clears it), so this must NOT go through buildHeaders/getAcademyId
 * — same reason postPublicJson exists for the contact form.
 */
export const getLegalDocuments = async (
  options?: RequestOptions,
): Promise<LegalDocumentSummary[]> => {
  const response = await apiFetch('/legal/documents', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal: options?.signal,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw Object.assign(new Error(response.statusText || 'Request failed'), {
      status: response.status,
    });
  }
  const raw = (await response.json()) as unknown;
  if (Array.isArray(raw)) return raw as LegalDocumentSummary[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: LegalDocumentSummary[] }).data;
  }
  return [];
};

export type LegalPendingDocument = {
  type: string;
  version: string;
  title: string;
};

export type LegalChangeLine = {
  value: string;
  added?: boolean;
  removed?: boolean;
};
