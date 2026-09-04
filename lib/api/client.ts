"use client";

import type { AuthResponse } from "@/lib/api/types";
import { getClientBackendApiBaseUrl, env } from "@/lib/env";

const withTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const getBaseUrl = () => withTrailingSlash(getClientBackendApiBaseUrl());

export type RequestOptions = {
  signal?: AbortSignal;
  skipRefresh?: boolean; // Skip token refresh for this request
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Which academy this browser is on: the cookie the tenant middleware set, then
 * the build-time default. Every tenant-scoped call must go through this — a
 * second, hand-rolled copy is how one flow ends up on a different academy.
 */
export const resolveAcademyId = (): string | null =>
  getCookieValue(env.academyIdCookie) ?? env.defaultAcademyId;

const getAcademyId = (): string => {
  const academyId = resolveAcademyId();
  if (academyId) {
    return academyId;
  }
  throw new Error(
    "Academy ID is required but not found in cookies or environment variables",
  );
};

const getAcademySlug = (): string | null => {
  return getCookieValue(env.academySlugCookie);
};

let csrfBootstrap: Promise<string | null> | null = null;

/** Quietly mint a csrf-token cookie for fresh / private windows. */
async function ensureCsrfToken(force = false): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!force) {
    const existing = getCookieValue("csrf-token");
    if (existing) return existing;
  }
  if (csrfBootstrap) return csrfBootstrap;

  csrfBootstrap = (async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/auth/csrf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) return getCookieValue("csrf-token");
      const data = (await response.json().catch(() => null)) as {
        csrf_token?: string;
      } | null;
      return data?.csrf_token ?? getCookieValue("csrf-token");
    } catch {
      return getCookieValue("csrf-token");
    } finally {
      csrfBootstrap = null;
    }
  })();

  return csrfBootstrap;
}

const buildHeaders = async (
  additionalHeaders: HeadersInit = {},
  options?: { mutate?: boolean },
): Promise<HeadersInit> => {
  const headers = new Headers(additionalHeaders);
  headers.set("X-Academy-ID", getAcademyId());

  const academySlug = getAcademySlug();
  if (academySlug) {
    headers.set("X-Academy-Slug", academySlug);
  }

  if (options?.mutate) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  } else {
    const csrfToken = getCookieValue("csrf-token");
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
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
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("[Auth] Token refreshed successfully");
        return true;
      }

      console.warn("[Auth] Token refresh failed:", response.status);
      return false;
    } catch (error) {
      console.error("[Auth] Token refresh error:", error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Redirect to login page
 */
function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname + window.location.search;
    const storeSlug = getAcademySlug();
    const loginPath = storeSlug ? `/${storeSlug}/auth/login` : "/auth/login";
    if (!currentPath.includes("/login")) {
      const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }
  }
}

export const LEGAL_CONSENT_REQUIRED_CODE = "LEGAL_CONSENT_REQUIRED";
export const LEGAL_CONSENT_REQUIRED_EVENT = "mentoma:legal-consent-required";

async function handleResponse<T>(
  response: Response,
  retryFn?: () => Promise<T>,
  skipRefresh?: boolean,
  retriedCsrf = false,
): Promise<T> {
  const contentType = response.headers.get("Content-Type") ?? "";
  const isJson = contentType.includes("application/json");

  // Check if response is not in 2xx range
  if (!response.ok) {
    let errorMessage = response.statusText || "Request failed";
    let errorCode: string | undefined;

    if (isJson) {
      try {
        const parsed = (await response.json()) as unknown;
        if (typeof parsed === "object" && parsed !== null) {
          // The stable code is what callers branch on (e.g. CAPTCHA_REQUIRED);
          // the message is already translated and is only for display.
          if ("code" in parsed && typeof parsed.code === "string") {
            errorCode = parsed.code;
          }
          // Try to extract error message from various possible fields
          if ("message" in parsed && typeof parsed.message === "string") {
            errorMessage = parsed.message;
          } else if ("error" in parsed && typeof parsed.error === "string") {
            errorMessage = parsed.error;
          } else if (
            "error" in parsed &&
            typeof parsed.error === "object" &&
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
      console.log("[Auth] Access token expired, attempting refresh...");
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
    if (
      errorCode === LEGAL_CONSENT_REQUIRED_CODE &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new CustomEvent(LEGAL_CONSENT_REQUIRED_EVENT));
    }

    // Fresh tab / rotated cookie — mint CSRF once and retry without toasting.
    if (errorCode === "CSRF_REQUIRED" && retryFn && !retriedCsrf) {
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
  "/auth/public/login",
  "/auth/staff/login",
  "/auth/admin/login",
  "/auth/public/identify",
  "/auth/register",
  "/auth/quick-signup",
  "/auth/refresh",
  "/auth/logout",
  "/auth/login-by-phone-otp",
  "/auth/login-by-email-otp",
  "/auth/confirm-phone",
  "/auth/set-new-password",
  "/auth/forget-password",
  "/auth/otp/",
] as const;

const isPreSessionAuthPath = (path: string): boolean =>
  PRE_SESSION_AUTH_PATHS.some((authPath) => path.includes(authPath));

export const postJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (
    skipRefresh = false,
    retriedCsrf = false,
  ): Promise<T> => {
    const headers = await buildHeaders(
      {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      { mutate: true },
    );

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      credentials: "include",
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

/**
 * POST from a page with no academy context (the platform contact form).
 * `postJson` always stamps `X-Academy-ID` and throws on the root domain, where
 * no academy cookie exists — this one only bootstraps CSRF and sends the body.
 */
export const postPublicJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (retriedCsrf = false): Promise<T> => {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    return handleResponse<T>(
      response,
      () => makeRequest(true),
      true,
      retriedCsrf,
    );
  };

  return makeRequest();
};

export const getJson = async <T>(
  path: string,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (
    skipRefresh = false,
    retriedCsrf = false,
  ): Promise<T> => {
    const headers = await buildHeaders({
      Accept: "application/json",
    });

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "GET",
      credentials: "include",
      headers,
      signal: options?.signal,
    });
    return handleResponse<T>(
      response,
      () => makeRequest(true, true),
      skipRefresh,
      retriedCsrf,
    );
  };

  return makeRequest(options?.skipRefresh);
};

const putJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (
    skipRefresh = false,
    retriedCsrf = false,
  ): Promise<T> => {
    const headers = await buildHeaders(
      {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      { mutate: true },
    );

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(
      response,
      () => makeRequest(true, true),
      skipRefresh,
      retriedCsrf,
    );
  };

  return makeRequest(options?.skipRefresh);
};

export const patchJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (
    skipRefresh = false,
    retriedCsrf = false,
  ): Promise<T> => {
    const headers = await buildHeaders(
      {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      { mutate: true },
    );

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(
      response,
      () => makeRequest(true, true),
      skipRefresh,
      retriedCsrf,
    );
  };

  return makeRequest(options?.skipRefresh);
};

const deleteJson = async <T>(
  path: string,
  options?: RequestOptions,
): Promise<T> => {
  const makeRequest = async (
    skipRefresh = false,
    retriedCsrf = false,
  ): Promise<T> => {
    const headers = await buildHeaders(
      {
        Accept: "application/json",
      },
      { mutate: true },
    );

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers,
      signal: options?.signal,
    });
    return handleResponse<T>(
      response,
      () => makeRequest(true, true),
      skipRefresh,
      retriedCsrf,
    );
  };

  return makeRequest(options?.skipRefresh);
};

export type LoginPayload = {
  identifier: string;
  password: string;
  academy_id?: string;
  role?: string;
};

export const login = async (
  payload: LoginPayload,
  options?: RequestOptions,
) => {
  return postJson<AuthResponse>(
    "/auth/public/login",
    {
      ...payload,
      academy_id: payload.academy_id ?? getAcademyId(),
    },
    options,
  );
};

export const isCaptchaRequiredError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: string }).code === "CAPTCHA_REQUIRED";

export type AccountIdentity = {
  exists: boolean;
  channel: "phone" | "email";
  can_use_password: boolean;
  can_use_otp: boolean;
  captcha_required: boolean;
  /** Member of some other academy, but not of this one (the panel uses it). */
  member_elsewhere?: boolean;
};

/**
 * Identifier-first login step 1: which sign-in methods this identifier has in
 * THIS academy. Lets an unknown visitor be sent to signup instead of failing a
 * password they never had.
 */
export const identifyAccount = async (
  identifier: string,
  captchaToken?: string,
  options?: RequestOptions,
) => {
  return postJson<AccountIdentity>(
    "/auth/public/identify",
    {
      identifier,
      academy_id: getAcademyId(),
      ...(captchaToken ? { captcha_token: captchaToken } : {}),
    },
    options,
  );
};

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

export const register = async (
  payload: RegisterPayload,
  options?: RequestOptions,
) => {
  return postJson<AuthResponse>(
    "/auth/register",
    {
      role: "USER",
      academy_id: resolveAcademyId() ?? undefined,
      ...payload,
    },
    options,
  );
};

export const logout = async (options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/logout", {}, options);
};

export const me = (options?: RequestOptions) => {
  return getJson<{ id?: string; status?: string; data?: unknown }>(
    "/auth/me",
    options,
  );
};

export type QuickSignupPayload = {
  phone_number: string;
  display_name: string;
  accepted_terms_version: string;
  accepted_privacy_version: string;
};

/**
 * Landing fast flow, step 1: turn a verified phone into a logged-in manager.
 * No password — the OTP just verified IS the credential. Opens the session, so
 * `quickStartAcademy` can run immediately after.
 */
export const quickSignup = (
  payload: QuickSignupPayload,
  options?: RequestOptions,
) => {
  return postJson<AuthResponse>("/auth/quick-signup", { ...payload }, options);
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
  return postJson<QuickStartResult>(
    "/academies/quick-start",
    { ...payload },
    options,
  );
};

export const checkAcademySlug = (slug: string, options?: RequestOptions) => {
  return getJson<{ available: boolean }>(
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
 * Public list of current legal docs. Always skipRefresh: a stale session cookie
 * must not redirect the landing signup away or return null mid-flow.
 */
export const getLegalDocuments = async (
  options?: RequestOptions,
): Promise<LegalDocumentSummary[]> => {
  const raw = await getJson<
    LegalDocumentSummary[] | { data?: LegalDocumentSummary[] }
  >(`/legal/documents`, { ...options, skipRefresh: true });
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.data)) return raw.data;
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

export type LegalDocumentDiff = {
  type: string;
  title: string;
  version: string;
  previousVersion: string | null;
  /** null when there is nothing to compare against (first acceptance). */
  diff: LegalChangeLine[] | null;
};

// The /legal endpoints answer with bare objects — no {status,data} envelope.

export const getLegalAcceptanceStatus = (options?: RequestOptions) =>
  getJson<{ up_to_date: boolean; pending: LegalPendingDocument[] }>(
    "/legal/acceptances/status",
    options,
  );

export const getLegalAcceptanceDiff = (options?: RequestOptions) =>
  getJson<LegalDocumentDiff[]>("/legal/acceptances/diff", options);

export const acceptPlatformLegalDocuments = (
  locale?: string,
  options?: RequestOptions,
) =>
  postJson<{ accepted: string[] }>(
    "/legal/acceptances/platform",
    locale ? { locale } : {},
    options,
  );

// ----- Notifications -----

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export const listNotifications = (
  params?: { page?: number; limit?: number },
  options?: RequestOptions,
) => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 30));
  return getJson<{
    status: string;
    data: { notifications: NotificationRow[]; pagination: { total: number } };
  }>(`/notifications?${query}`, options);
};

export const getUnreadNotificationCount = (options?: RequestOptions) =>
  getJson<{ status: string; data: { count: number } }>(
    "/notifications/unread-count",
    options,
  );

export const markNotificationRead = (id: string, options?: RequestOptions) =>
  patchJson<{ status: string; data: { id: string } }>(
    `/notifications/${id}/read`,
    {},
    options,
  );

export const markAllNotificationsRead = (options?: RequestOptions) =>
  postJson<{ status: string; data: { updated_count: number } }>(
    "/notifications/read-all",
    {},
    options,
  );

/**
 * The academy's refund window is enforced server-side, so a rejection comes back
 * as a stable error `code` rather than being pre-judged in the UI.
 */
export const requestRefund = (
  payload: { payment_id: string; amount?: number; reason?: string },
  options?: RequestOptions,
) => {
  return postJson<{ status: string; message: string; data: { id: string } }>(
    "/refunds/requests",
    payload,
    options,
  );
};

export const getMyLegalAcceptances = (options?: RequestOptions) =>
  getJson<
    Array<{
      type: string;
      version: string;
      accepted_at: string;
      locale: string;
    }>
  >("/legal/acceptances/me", options);

export type SendOtpPayload = {
  email?: string;
  phone_number?: string;
};

export type VerifyOtpPayload = {
  email?: string;
  phone_number?: string;
  otp: string;
};

export type ForgetPasswordPayload = {
  identifier: string;
  password: string;
  confirmed_password: string;
  otp: string;
  academy_id?: string;
};

export const validatePhoneAndEmail = (
  phone_number?: string,
  email?: string,
  options?: RequestOptions,
) => {
  return postJson<{
    success: boolean;
    message: string;
    phone_number: string;
    email: string;
  }>(
    "/auth/otp/validate-phone-email",
    {
      ...(phone_number ? { phone_number } : {}),
      ...(email ? { email } : {}),
    },
    options,
  );
};

export const sendEmailOtp = (
  email: string,
  type: string,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string }>(
    "/auth/otp/send-email",
    {
      email,
      type,
    },
    options,
  );
};

export const sendPhoneOtp = (
  phone_number: string,
  type: string,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string }>(
    "/auth/otp/send-phone",
    {
      phone_number,
      type,
    },
    options,
  );
};

export const loginByPhoneOtp = (
  phone_number: string,
  otp: string,
  options?: RequestOptions,
) => {
  return postJson<AuthResponse>(
    "/auth/login-by-phone-otp",
    { phone_number, otp },
    options,
  );
};

export const loginByEmailOtp = (
  email: string,
  otp: string,
  options?: RequestOptions,
) => {
  return postJson<AuthResponse>(
    "/auth/login-by-email-otp",
    { email, otp },
    options,
  );
};

export const verifyEmailOtp = (
  email: string,
  otp: string,
  type: string,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string; success?: boolean }>(
    "/auth/otp/verify-email",
    {
      email,
      otp,
      type,
    },
    options,
  );
};

export const verifyPhoneOtp = (
  phone_number: string,
  otp: string,
  type: string,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string; success?: boolean }>(
    "/auth/otp/verify-phone",
    {
      phone_number,
      otp,
      type,
    },
    options,
  );
};

export const forgetPassword = (
  payload: ForgetPasswordPayload,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string }>(
    "/auth/forget-password",
    {
      ...payload,
      academy_id: payload.academy_id ?? resolveAcademyId() ?? undefined,
    },
    options,
  );
};

export const changePassword = (
  payload: {
    profile_id: string;
    current_password: string;
    new_password: string;
    confirm_new_password: string;
  },
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string; success?: boolean }>(
    "/auth/change-password",
    payload,
    options,
  );
};

export const updateProfile = async (
  profileId: string,
  data: { display_name?: string; image_id?: string },
  options?: RequestOptions,
) => {
  const response = await patchJson<{
    message: string;
    status: string;
    data: {
      id: string;
      display_name: string;
      avatar_id: string | null;
      avatar: { id: string; url: string; alt: string | null } | null;
    };
  }>(`/profiles/${profileId}`, data, options);
  return response.data;
};

/**
 * Uploads an image and returns its id. The backend field name is `imagefile`;
 * Content-Type must be left to the browser so the multipart boundary is set.
 */
export const uploadImage = async (
  file: File,
  alt: string,
  options?: RequestOptions,
): Promise<{ id: string; url: string; publicUrl: string | null }> => {
  const body = new FormData();
  body.append("imagefile", file);
  body.append("alt", alt);

  const response = await fetch(`${getBaseUrl()}/images/upload`, {
    method: "POST",
    credentials: "include",
    headers: await buildHeaders(
      { Accept: "application/json" },
      { mutate: true },
    ),
    body,
    signal: options?.signal,
  });

  const parsed = await handleResponse<{
    status: string;
    data: { id: string; url: string; publicUrl: string | null };
  }>(response);
  return parsed.data;
};

export const updateStore = async (
  data: { name?: string; description?: string },
  options?: RequestOptions,
) => {
  const response = await patchJson<{
    message: string;
    status: string;
    data: {
      id: string;
      name: string;
      description?: string;
    };
  }>("/academies/current", data, options);
  return response.data;
};

export type LessonLiveSession = {
  id: string;
  lesson_id: string;
  meeting_url: string | null;
  playback_url?: string | null;
  starts_at: string;
  ends_at?: string | null;
  duration_minutes?: number | null;
  timezone: string;
  recurrence_rule?: string | null;
  recurrence_until?: string | null;
  provider_label?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export const getLesson = async (
  lessonId: string | number,
  options?: RequestOptions,
) => {
  const raw = await getJson<{
    status?: string;
    data?: Record<string, unknown> | null;
  }>(`/lessons/${lessonId}`, options);
  if (raw && typeof raw === "object" && raw.status === "ok" && raw.data) {
    return raw.data;
  }
  return null;
};

export const getLessonLiveSession = async (
  lessonId: string | number,
  options?: RequestOptions,
): Promise<LessonLiveSession | null> => {
  const raw = await getJson<{
    status?: string;
    data?: LessonLiveSession | null;
    message?: string;
  }>(`/lessons/${lessonId}/live-session`, options);
  if (raw && typeof raw === "object" && raw.status === "ok" && raw.data) {
    return raw.data;
  }
  return null;
};

export interface CourseQnA {
  id: string;
  course_id: string;
  user_id: string;
  profile_id: string;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_by: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
  };
  profile?: {
    id: string;
    display_name: string;
  };
  answerer?: {
    id: string;
    display_name: string;
  } | null;
}

export const getCourseQnAs = async (
  courseId: string,
  options?: RequestOptions,
) => {
  const response = await getJson<{
    message: string;
    status: string;
    data: CourseQnA[];
  }>(`/courses/${courseId}/qna`, options);
  return response.data ?? [];
};

export const createCourseQnA = async (
  courseId: string,
  question: string,
  options?: RequestOptions,
) => {
  const response = await postJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna`, { question }, options);
  return response.data;
};

export const approveCourseQnA = async (
  courseId: string,
  qnaId: string,
  isApproved: boolean,
  options?: RequestOptions,
) => {
  const response = await putJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(
    `/courses/${courseId}/qna/${qnaId}/approve`,
    { is_approved: isApproved },
    options,
  );
  return response.data;
};

export const answerCourseQnA = async (
  courseId: string,
  qnaId: string,
  answer: string,
  options?: RequestOptions,
) => {
  const response = await putJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna/${qnaId}/answer`, { answer }, options);
  return response.data;
};

export interface CourseReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  created_at: string;
  Profile?: {
    id: string;
    display_name: string;
    Image_Profile_avatar_idToImage?: { publicUrl: string | null } | null;
  };
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  summary: { avg_rating: number; total_reviews: number; can_review: boolean };
}

export const getCourseReviews = async (
  courseId: string,
  options?: RequestOptions,
) => {
  const response = await getJson<{
    message: string;
    status: string;
    data: CourseReviewsResponse;
  }>(`/courses/${courseId}/reviews`, options);
  return response.data;
};

export const createCourseReview = async (
  courseId: string,
  review: { rating: number; title?: string; content?: string },
  options?: RequestOptions,
) => {
  const response = await postJson<{
    message: string;
    status: string;
    data: CourseReview;
  }>(`/courses/${courseId}/reviews`, review, options);
  return response.data;
};

// ============================================================================
// SESSION MANAGEMENT APIs
// ============================================================================

export interface ActiveSession {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  is_current: boolean;
}

/**
 * Get all active sessions for the current user
 */
export const getActiveSessions = async (options?: RequestOptions) => {
  const response = await getJson<{
    success: boolean;
    sessions: ActiveSession[];
  }>("/auth/sessions", options);
  return response.sessions ?? [];
};

/**
 * Revoke a specific session by ID
 */
export const revokeSession = async (
  sessionId: string,
  options?: RequestOptions,
) => {
  return deleteJson<{
    success: boolean;
    message: string;
  }>(`/auth/sessions/${sessionId}`, options);
};

/**
 * Logout from all devices (revoke all sessions)
 */
export const logoutAllDevices = async (options?: RequestOptions) => {
  return postJson<{
    message: string;
    revokedCount: number;
  }>("/auth/logout-all", {}, options);
};

// =====================================================================
// Quiz, Assessment & Discussion (checklist 5.19)
// =====================================================================

export type QuizQuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_TEXT";
export type QuizAttemptStatus = "IN_PROGRESS" | "PENDING_REVIEW" | "GRADED";

export interface QuizOption {
  id: string;
  text: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  points: number;
  order: number;
  Option: QuizOption[];
}

export interface StudentQuiz {
  id: string;
  title: string;
  description?: string | null;
  passing_score: number;
  is_published: boolean;
  Question: QuizQuestion[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_boolean?: boolean | null;
  answer_text?: string | null;
  is_correct?: boolean | null;
  awarded_points: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  status: QuizAttemptStatus;
  score: number;
  max_score: number;
  passed?: boolean | null;
  feedback?: string | null;
  Answer?: QuizAnswer[];
}

export interface AnswerInput {
  question_id: string;
  selected_option_id?: string;
  answer_boolean?: boolean;
  answer_text?: string;
}

export interface DiscussionMessage {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  Author?: { id: string; display_name: string | null };
}

type Envelope<T> = { message: string; status: string; data: T };

export const getLessonQuiz = async (
  lessonId: string,
  options?: RequestOptions,
) =>
  (await getJson<Envelope<StudentQuiz>>(`/lessons/${lessonId}/quiz`, options))
    .data;

export const startQuizAttempt = async (
  quizId: string,
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<QuizAttempt>>(
      `/quizzes/${quizId}/attempt`,
      {},
      options,
    )
  ).data;

export const saveQuizAnswers = async (
  attemptId: string,
  answers: AnswerInput[],
  options?: RequestOptions,
) =>
  (
    await patchJson<Envelope<{ attempt_id: string }>>(
      `/quiz-attempts/${attemptId}/answers`,
      { answers },
      options,
    )
  ).data;

export const submitQuizAttempt = async (
  attemptId: string,
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<QuizAttempt>>(
      `/quiz-attempts/${attemptId}/submit`,
      {},
      options,
    )
  ).data;

export const getQuizAttempt = async (
  attemptId: string,
  options?: RequestOptions,
) =>
  (await getJson<Envelope<QuizAttempt>>(`/quiz-attempts/${attemptId}`, options))
    .data;

export const getDiscussionThread = async (
  threadId: string,
  options?: RequestOptions,
) =>
  (
    await getJson<Envelope<{ thread: unknown; messages: DiscussionMessage[] }>>(
      `/discussions/threads/${threadId}`,
      options,
    )
  ).data;

/** Every parent a thread can hang from. Exactly one is sent. */
export type DiscussionParent = {
  attempt_id?: string;
  submission_id?: string;
  engagement_id?: string;
  tutoring_session_id?: string;
  tutoring_group_id?: string;
};

/**
 * The thread for a parent, whether or not it exists yet. A chat box has to
 * render before anyone has written in it, and threads are created lazily.
 */
export const findDiscussionThread = async (
  parent: DiscussionParent,
  options?: RequestOptions,
) => {
  const query = new URLSearchParams(
    Object.entries(parent).filter(([, value]) => Boolean(value)) as [
      string,
      string,
    ][],
  );
  return (
    await getJson<
      Envelope<{ thread: { id: string } | null; messages: DiscussionMessage[] }>
    >(`/discussions/thread?${query.toString()}`, options)
  ).data;
};

export const postDiscussionMessage = async (
  parent: DiscussionParent,
  body: string,
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<DiscussionMessage>>(
      `/discussions/messages`,
      { ...parent, body },
      options,
    )
  ).data;

// ----- Support tickets -----

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_ON_USER"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type TicketCategory =
  | "BILLING"
  | "PAYMENT"
  | "COURSE_ACCESS"
  | "LIVE_CLASS"
  | "TECHNICAL"
  | "CONTENT"
  | "OTHER";

export interface TicketPerson {
  id: string;
  display_name: string;
}

export interface TicketResponsible extends TicketPerson {
  role: string;
}

export interface TicketListItem {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  created_at: string;
  last_activity_at: string;
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  _count: { Message: number };
}

export interface TicketAttachmentView {
  id: string;
  image_id: string;
  mime: string;
}

export interface TicketMessageView {
  id: string;
  kind: "USER_MESSAGE" | "INTERNAL_NOTE" | "SYSTEM_EVENT";
  body: string;
  author_id: string;
  author_role: string;
  created_at: string;
  system_event_type?: string | null;
  system_meta?: Record<string, string | null> | null;
  Author: TicketPerson | null;
  Attachment: TicketAttachmentView[];
}

export interface TicketCapabilities {
  canView: boolean;
  canReply: boolean;
  canManage: boolean;
  canReassign: boolean;
  canInternalNote: boolean;
  isAuthor: boolean;
  isPlatformStaff: boolean;
}

export interface TicketDetail {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  scope: "ACADEMY" | "PLATFORM";
  created_at: string;
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  Message: TicketMessageView[];
  CallRequest: Array<{
    id: string;
    status: string;
    phone: string;
    outcome_note: string | null;
    called_at: string | null;
  }>;
  Rating: { score: number; comment: string | null } | null;
  capabilities: TicketCapabilities;
}

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  priority?: TicketPriority;
  responsible_id: string;
  body: string;
  image_ids?: string[];
  request_call?: boolean;
  phone?: string;
  preferred_time?: string;
}

export const listSupportResponsibles = async (options?: RequestOptions) =>
  (
    await getJson<Envelope<TicketResponsible[]>>(
      `/support/responsibles`,
      options,
    )
  ).data;

export const listMySupportTickets = async (
  params?: { status?: TicketStatus },
  options?: RequestOptions,
) => {
  const qs = params?.status ? `?status=${params.status}` : "";
  return (
    await getJson<Envelope<{ items: TicketListItem[]; total: number }>>(
      `/support/tickets/mine${qs}`,
      options,
    )
  ).data;
};

export const getSupportTicket = async (id: string, options?: RequestOptions) =>
  (await getJson<Envelope<TicketDetail>>(`/support/tickets/${id}`, options))
    .data;

export const createSupportTicket = async (
  payload: CreateTicketPayload,
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<TicketDetail>>(
      `/support/tickets`,
      { ...payload },
      options,
    )
  ).data;

export const replySupportTicket = async (
  id: string,
  payload: { body: string; image_ids?: string[] },
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<{ id: string }>>(
      `/support/tickets/${id}/reply`,
      { ...payload },
      options,
    )
  ).data;

export const requestSupportCall = async (
  id: string,
  payload: { phone: string; preferred_time?: string },
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<TicketDetail>>(
      `/support/tickets/${id}/request-call`,
      { ...payload },
      options,
    )
  ).data;

export const rateSupportTicket = async (
  id: string,
  payload: { score: number; comment?: string },
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<{ ticket_id: string; score: number }>>(
      `/support/tickets/${id}/rate`,
      { ...payload },
      options,
    )
  ).data;

export const uploadSupportAttachment = async (
  file: File,
  options?: RequestOptions,
) => {
  const form = new FormData();
  form.append("file", file);
  // No Content-Type: the browser sets the multipart boundary itself.
  const headers = await buildHeaders({}, { mutate: true });
  const response = await fetch(`${getBaseUrl()}/support/attachments`, {
    method: "POST",
    credentials: "include",
    headers,
    body: form,
    signal: options?.signal,
  });
  return (
    await handleResponse<Envelope<{ id: string; mime: string; size: number }>>(
      response,
      undefined,
      true,
    )
  ).data;
};
