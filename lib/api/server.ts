import 'server-only';

import { cache } from 'react';
import { cookies, headers as nextHeaders } from 'next/headers';

import { decodePathSegment } from '@/lib/content-paths';
import { getBackendApiBaseUrl, env } from '@/lib/env';
import { logger } from '@/lib/logging/app-logger';
import { DEFAULT_LANGUAGE } from '@/lib/i18n/config';
import { resolvePublicOriginFromHeaders } from '@/lib/public-request-origin';

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

const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof UnauthorizedError) return true;
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status?: number }).status === 401;
  }
  return error instanceof Error && /401/.test(error.message);
};

import type { CertificateVerification, CourseTopic } from '@/lib/api/account-types';
import type { PublicActiveDiscount } from '@/lib/discounts/format-active-discount';
import type {
  ApiEnvelope,
  ArticleSummary,
  CategorySummary,
  CourseListPayload,
  CourseSummary,
  StoreDetail,
  StoreSummary,
  UserProfilesResponse,
  EnrollmentSummary,
  LessonSummary,
  Pagination,
} from '@/lib/api/types';

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
const PUBLIC_REVALIDATE_SECONDS = 60;

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

export async function getAcademiesPublic(params?: { search?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  const result = await serverFetch<StoreSummary[]>(`/academies/public${suffix}`, {
    includeAuth: false,
  });
  return result.data;
}

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    const result = await serverFetch<CategorySummary[]>('/categories', {
      includeAuth: false,
    });
    if (!result || result.status !== 'ok' || !Array.isArray(result.data)) {
      return [];
    }
    return result.data;
  } catch {
    return [];
  }
}

/**
 * The blog of one academy, or of the platform when `academySlug` is omitted.
 * The scope must be explicit: the backend reads only this parameter, so a
 * missing tenant can never widen the query to every academy's posts.
 */
export async function getBlogArticles(academySlug?: string | null) {
  const result = await serverFetch<ArticleSummary[]>('/blog', {
    includeAuth: false,
    query: academySlug ? { academy_slug: academySlug } : undefined,
  });
  return result.data;
}

export async function getCourses(params?: {
  search?: string;
  title?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  order_by?: string;
  published?: boolean;
  is_featured?: boolean;
  is_free?: boolean;
  category_id?: string;
  academy_id?: string;
}) {
  try {
    const result = await serverFetch<CourseListPayload>('/courses', {
      query: {
        ...params,
      },
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<CourseListPayload>('/courses/public', {
        includeAuth: false,
        query: {
          ...params,
          published: true,
        },
      }).catch(() => null);
      return fallback?.data ?? null;
    }
    throw error;
  }
}

export async function getCourseById(id: string | number) {
  const key = encodeURIComponent(decodePathSegment(String(id)));
  try {
    const result = await serverFetch<CourseSummary>(`/courses/${key}`);
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<CourseSummary>(`/courses/public/${key}`, {
        includeAuth: false,
      }).catch(() => null);
      return fallback?.data ?? null;
    }
    throw error;
  }
}

/**
 * Storefront course page. Always reads the public endpoint so the payload shape
 * is the same for a guest and a signed-in student — the authed `/courses/:id`
 * is the panel's editor view and returns a different, narrower shape.
 */
export async function getPublicCourseDetail(
  id: string,
  options?: {
    /** Skip Next fetch cache — use before granting storefront access. */ fresh?: boolean;
  },
) {
  const result = await serverFetch<CourseSummary>(
    `/courses/public/${encodeURIComponent(decodePathSegment(id))}`,
    {
      includeAuth: false,
      revalidate: options?.fresh ? 0 : undefined,
    },
  ).catch(() => null);
  return result?.data ?? null;
}

/**
 * Public certificate check. Anyone holding the number — an employer, a parent —
 * can confirm it without an account, which is the only thing that makes a
 * certificate worth printing.
 */
export async function verifyCertificate(certificateNumber: string) {
  const result = await serverFetch<CertificateVerification>(
    `/certificates/verify/${encodeURIComponent(certificateNumber)}`,
    { includeAuth: false },
  ).catch(() => null);
  return result?.data ?? null;
}

/**
 * Free-preview lesson for the storefront. Readable without a session — the
 * backend serves it only when the lesson is a free, published lesson of a
 * published course, so nothing paid can leak through this call.
 */
export async function getPublicLesson(id: string) {
  const result = await serverFetch<LessonSummary>(`/lessons/public/${id}`, {
    includeAuth: false,
  }).catch(() => null);
  return result?.data ?? null;
}

export async function getBlogArticleBySlug(slug: string, academySlug?: string | null) {
  const result = await serverFetch<ArticleSummary>(`/blog/${encodeURIComponent(slug)}`, {
    includeAuth: false,
    query: academySlug ? { academy_slug: academySlug } : undefined,
  });
  return result.data;
}

export async function getCurrentAcademy() {
  try {
    const result = await serverFetch<StoreDetail>('/academies/current');
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

/**
 * The public academy list is read several times per render (layout, footer,
 * page). `cache` collapses those into one backend call per request, which also
 * keeps the render under the endpoint's rate limit.
 *
 * Returns `null` when the list could not be fetched, so callers can tell
 * "no such academy" apart from "backend unavailable".
 */
export const getPublicAcademies = cache(async (): Promise<StoreSummary[] | null> => {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: StoreSummary[];
    }>('/academies/public', { includeAuth: false });
    return result.data ?? null;
  } catch {
    return null;
  }
});

/**
 * Public branding/identity for one academy. Asks the directory for this slug
 * only — the unfiltered list is capped, so scanning it would silently miss any
 * academy past the cap.
 */
export const getAcademyBySlug = cache(async (slug: string): Promise<StoreSummary | null> => {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: StoreSummary[];
    }>(`/academies/public?slug=${encodeURIComponent(slug)}`, {
      includeAuth: false,
    });
    return result.data?.[0] ?? null;
  } catch {
    return null;
  }
});

export type AcademyEnrollmentStatus = {
  /** True while the academy is closed to NEW enrollments. */
  disabled: boolean;
  disabled_until: string | null;
  message: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  academy_name: string;
};

/**
 * Whether this academy still takes new students. Closed means the buy/enroll
 * buttons are refused — students who already paid keep their access.
 */
export async function getAcademyEnrollmentStatus(
  slug: string,
): Promise<AcademyEnrollmentStatus | null> {
  if (!slug) return null;
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: AcademyEnrollmentStatus;
    }>('/academies/public/site-status', {
      includeAuth: false,
      query: { slug },
    });
    return result.data ?? null;
  } catch {
    return null;
  }
}

export type { PublicActiveDiscount };

/** Live student coupon codes for the storefront promo strip. */
export async function getActiveStudentDiscounts(slug: string): Promise<PublicActiveDiscount[]> {
  if (!slug) return [];
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: PublicActiveDiscount[];
    }>('/discounts/public/active', {
      includeAuth: false,
      query: { slug },
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ['active-discounts'],
    });
    return result.data ?? [];
  } catch {
    return [];
  }
}

export async function getCurrentUser() {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: {
        id: string;
        email: string | null;
        phone_number: string | null;
        display_name: string;
        avatar: { id: string; url: string } | null;
        has_password: boolean;
        last_login: Date | null;
        login_count: number;
        academyId: string;
        role: string;
        email_confirmed: boolean;
        phone_confirmed: boolean;
        isActive: boolean;
        isVerified: boolean;
        currentAcademy: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          currency: string;
          currency_symbol: string;
        } | null;
        permissions: string[];
      };
    }>('/auth/me');
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function getPublicPricingConfig() {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        title: string;
        subtitle: string;
        cta_label: string;
      };
    }>('/academies/public/pricing-config', {
      includeAuth: false,
    });

    return result.data;
  } catch {
    return null;
  }
}

export type PublicPlan = {
  slug: string;
  name: string;
  price_monthly_toman: number;
  price_yearly_toman: number | null;
  storage_gb: number;
  limits: {
    managers: number;
    teachers: number;
    courses: number;
    tutoring_students: number;
    storage_gb: number;
    /** Delivered media traffic allowed per calendar month, in GB. */
    monthly_traffic_gb: number;
  };
  features: string[];
  is_most_popular: boolean;
  annual_months_included: number;
  free_trial_days: number;
  /** Announced-but-not-yet-applied price, so the site can warn before it lands. */
  upcoming_price?: {
    price_monthly_toman: number;
    price_yearly_toman: number | null;
    effective_at: string;
    is_increase: boolean;
  } | null;
};

export async function getPublicPlans(): Promise<PublicPlan[]> {
  try {
    return await serverFetchRaw<PublicPlan[]>('/platform-settings/plans/active', {
      includeAuth: false,
    });
  } catch {
    return [];
  }
}

export async function getUserProfiles() {
  try {
    const result = await serverFetchRaw<UserProfilesResponse>('/auth/profiles', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    return result.profiles ?? [];
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function getEnrollments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: string | number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        enrollments: Array<EnrollmentSummary & { Course?: EnrollmentSummary['course'] }>;
        pagination: Pagination;
      };
    }>('/enrollments', {
      query: {
        ...params,
      },
    });
    return {
      ...result.data,
      enrollments: result.data.enrollments.map((enrollment) => ({
        ...enrollment,
        course: enrollment.course ?? enrollment.Course ?? null,
      })),
    };
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function createPayment(data: {
  course_id: string;
  user_id: string;
  profile_id: string;
  amount: number;
  payment_method: string;
  status?: string;
  gateway_id?: string;
  coupon_code?: string;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        course_id: string;
        user_id: string;
        profile_id: string;
        amount: number;
        currency: string;
        status: string;
        payment_method: string;
        gateway_id?: string | null;
        coupon_code?: string | null;
        created_at: string;
      };
    }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      throw new Error('Unauthorized. Please log in to continue.');
    }
    throw error;
  }
}

export async function initiateCheckoutPayment(data: {
  course_id: string;
  amount: number;
  coupon_code?: string;
  mobile?: string;
  provider?: 'BITPAY' | 'PAYPING' | 'SAMAN_SEP';
}) {
  const headerStore = await nextHeaders();
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const baseUrl = resolvePublicOriginFromHeaders(headerStore, fallbackBaseUrl);

  const payload = {
    ...data,
    callback_url: `${baseUrl}/payment/callback`,
  };

  const result = await serverFetchRaw<{
    status: string;
    data: {
      payment_id: string;
      amount: number;
      redirect_url: string;
    };
  }>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function getAcademyPlansPublic(kind?: 'SUBSCRIPTION' | 'PACKAGE') {
  const result = await serverFetchRaw<{
    status: string;
    data: Array<{
      id: string;
      kind: 'SUBSCRIPTION' | 'PACKAGE';
      name: string;
      description: string | null;
      price: number;
      currency: string;
      duration_days: number | null;
      AcademyPlanCourse: Array<{ Course: { id: string; title: string } }>;
    }>;
  }>(`/academy-plans/public${kind ? `?kind=${kind}` : ''}`, {
    method: 'GET',
  });
  return result.data ?? [];
}

/**
 * Bundles authored in the panel are `Offer` rows spanning several courses,
 * which is a different model from an AcademyPlan PACKAGE. The storefront shows
 * both, so it reads both.
 */
export interface PublicBundleOffer {
  id: string;
  type: PublicOfferingType;
  title: string | null;
  slug: string | null;
  description: string | null;
  price: number;
  /** Struck-through "before" figure; null when the bundle is not discounted. */
  compare_at_price: number | null;
  currency: string;
  access_duration_days: number | null;
  /** Ordered by `sort_order` server-side — a bundle is taught in this sequence. */
  Courses: Array<{
    sort_order: number;
    Course: {
      id: string;
      title: string;
      slug: string;
      short_description: string | null;
      duration: number | null;
      lessons_count: number;
    };
  }>;
}

export async function getAcademyBundlesPublic(): Promise<PublicBundleOffer[]> {
  const result = await serverFetchRaw<PublicBundleOffer[]>('/offers/public/bundles', {
    method: 'GET',
  }).catch(() => []);
  return Array.isArray(result) ? result : [];
}

/** One bundle by slug, for its own learning-path page. Null when not found. */
export async function getAcademyBundlePublic(slug: string): Promise<PublicBundleOffer | null> {
  const result = await serverFetchRaw<PublicBundleOffer>(
    `/offers/public/bundles/${encodeURIComponent(slug)}`,
    { method: 'GET' },
  ).catch(() => null);
  return result && typeof result === 'object' && 'id' in result ? result : null;
}

export interface PublicPaymentPlan {
  id: string;
  name: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  interval_days: number;
}

/**
 * Installments are behind a deployment flag; when it is off the endpoint is
 * unavailable and the storefront simply offers no installment option.
 */
export async function getCoursePaymentPlans(courseId: string): Promise<PublicPaymentPlan[]> {
  const result = await serverFetchRaw<PublicPaymentPlan[]>(
    `/payment-plans/courses/${encodeURIComponent(courseId)}`,
    { method: 'GET' },
  ).catch(() => []);
  return Array.isArray(result) ? result : [];
}

export interface PublicTutoringOffer {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  sessions_included: number | null;
  Tutor: { id: string; display_name: string | null } | null;
  /** True when the signed-in student already tutors under this offer. */
  owned?: boolean;
}

export async function getTutoringOffersPublic(courseId: string): Promise<PublicTutoringOffer[]> {
  const result = await serverFetchRaw<{
    status: string;
    data: PublicTutoringOffer[];
  }>(`/tutoring/offers/public?course_id=${encodeURIComponent(courseId)}`, {
    method: 'GET',
  });
  return result.data ?? [];
}

export interface PublicTutoringGroupSlot {
  weekday: number;
  start_minute: number;
  duration_minutes: number;
  lesson_id: string | null;
  Lesson: { id: string; title: string } | null;
}

export interface PublicTutoringGroup {
  id: string;
  title: string;
  description: string | null;
  timezone: string;
  capacity: number;
  seats_taken: number;
  seats_left: number;
  min_students: number;
  age_min: number | null;
  age_max: number | null;
  status: 'WAITING' | 'CONFIRMED' | 'RUNNING';
  starts_on: string | null;
  ends_on: string | null;
  term_weeks: number;
  session_count: number | null;
  join_deadline: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  course_id: string;
  /** Per-seat price of this class; null = the course's per-seat offer price. */
  seat_price: number | null;
  /** May one buyer take every seat (a private booking of the class)? */
  whole_class_booking: boolean;
  Slots: PublicTutoringGroupSlot[];
  Tutor: { id: string; display_name: string | null } | null;
  Offer: { id: string; price: number; currency: string } | null;
  /** True when the signed-in student already holds a seat in this class. */
  joined?: boolean;
  /** True when a teacher-scheduled meeting is in the join window right now. */
  session_live?: boolean;
  /** Upcoming meetings, dates only — no join link. */
  sessions?: readonly { starts_at: string; ends_at: string }[];
  /** Meetings already over — how far along a running class is. */
  sessions_held?: number;
}

/** Syllabus of a live course — what the meetings will cover. */
export async function getCourseTopicsPublic(courseId: string): Promise<CourseTopic[]> {
  const result = await serverFetchRaw<{ status: string; data: CourseTopic[] }>(
    `/courses/${encodeURIComponent(courseId)}/topics`,
    { method: 'GET' },
  );
  return result.data ?? [];
}

/** Scheduled group classes of a course that anyone may join. */
export async function getTutoringGroupsPublic(courseId: string): Promise<PublicTutoringGroup[]> {
  const load = (includeAuth: boolean) =>
    serverFetchRaw<{
      status: string;
      data: PublicTutoringGroup[];
    }>(`/tutoring/groups/public?course_id=${encodeURIComponent(courseId)}`, {
      method: 'GET',
      includeAuth,
    });

  try {
    const authed = await load(true);
    return authed.data ?? [];
  } catch {
    try {
      const anonymous = await load(false);
      return anonymous.data ?? [];
    } catch {
      return [];
    }
  }
}

/** A private class opened by its share code, so friends can book it together. */
export type TutoringGroupByCodeResult =
  | { status: 'ok'; group: PublicTutoringGroup }
  | { status: 'not_found' }
  | { status: 'course_unpublished' }
  | { status: 'class_unpublished' };

const joinInviteBlockReason = (error: unknown): 'course' | 'class' | null => {
  if (!error || typeof error !== 'object') return null;
  const enriched = error as { status?: number; code?: string };
  if (enriched.code === 'CLASS_NOT_PUBLISHED') return 'class';
  if (enriched.code === 'COURSE_NOT_PUBLISHED') return 'course';
  if (enriched.status !== 400) return null;
  const message = error instanceof Error ? error.message : '';
  if (/CLASS_NOT_PUBLISHED|کلاس هنوز برای ثبت‌نام باز نشده/i.test(message)) return 'class';
  if (/COURSE_NOT_PUBLISHED|not published|منتشر نشده/i.test(message)) return 'course';
  return 'course';
};

export async function getTutoringGroupByCode(code: string): Promise<TutoringGroupByCodeResult> {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: PublicTutoringGroup;
    }>(`/tutoring/groups/by-code/${encodeURIComponent(code)}`, {
      method: 'GET',
      revalidate: 0,
    });
    return result.data ? { status: 'ok', group: result.data } : { status: 'not_found' };
  } catch (error) {
    const blockReason = joinInviteBlockReason(error);
    if (blockReason === 'class') {
      return { status: 'class_unpublished' };
    }
    return { status: 'course_unpublished' };
  }
}

export type PublicOfferingType = 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'PRIVATE' | 'PAYMENT_PLAN';

export interface PublicCourseOffering {
  id: string;
  course_id: string;
  type: PublicOfferingType;
  title: string | null;
  description: string | null;
  price: number;
  /** Price before discount, shown struck through. Null = no discount shown. */
  compare_at_price: number | null;
  currency: string;
  access_duration_days: number | null;
  /** False sells the recorded course only — no live class link. */
  includes_live: boolean;
  is_active: boolean;
  payment_plan_id: string | null;
  /** Set when this offer mirrors the course's own price (the default offer). */
  source_course_id: string | null;
  /** True when the signed-in student already paid for this selling way. */
  owned?: boolean;
  /** End of the term this way granted; null means it does not expire. */
  access_expires_at?: string | null;
}

type OfferRow = Omit<PublicCourseOffering, 'course_id'> & {
  Courses?: Array<{ Course: { id: string } }>;
};

/**
 * Storefront: what a student can actually buy for this course. `Offer` is the
 * single source of price and access term — the course's own price is published
 * as its DEFAULT offer. The endpoint returns the array directly (no envelope).
 */
export interface PaymentSummary {
  id: string;
  amount: number;
  status: string;
  provider: string | null;
  /** Bank reference written at verify time — the number support can trace. */
  gateway_id: string | null;
  paid_at: string | null;
  created_at: string;
  Course: { id: string; title: string } | null;
}

/**
 * The paid receipt line the return-from-bank pages show. Ownership is enforced
 * by the backend, so a payment id in the URL can only ever load the buyer's own.
 */
export async function getPaymentSummary(paymentId: string): Promise<PaymentSummary | null> {
  try {
    const result = await serverFetchRaw<{
      status?: string;
      data?: PaymentSummary;
    }>(`/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
    return result.data ?? null;
  } catch {
    return null;
  }
}

export async function getCourseOfferingsPublic(courseId: string): Promise<PublicCourseOffering[]> {
  const result = await serverFetchRaw<OfferRow[]>(
    `/offers/course/${encodeURIComponent(courseId)}`,
    { method: 'GET' },
  ).catch(() => []);
  if (!Array.isArray(result)) return [];
  // An offer can span several courses (a bundle); flatten it onto the one asked for.
  return result.map((offer) => ({
    ...offer,
    course_id: offer.Courses?.[0]?.Course?.id ?? courseId,
  }));
}

export async function initiateAcademyPlanPayment(data: {
  academy_plan_id: string;
  amount: number;
  coupon_code?: string;
  mobile?: string;
}) {
  const headerStore = await nextHeaders();
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const baseUrl = resolvePublicOriginFromHeaders(headerStore, fallbackBaseUrl);

  const result = await serverFetchRaw<{
    status: string;
    data: { payment_id: string; amount: number; redirect_url: string };
  }>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      callback_url: `${baseUrl}/payment/callback`,
    }),
  });

  return result.data;
}

export async function createEnrollment(data: {
  course_id: string;
  user_id: string;
  profile_id: string;
  payment_id?: string;
  status?: string;
  progress_percent?: number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        course_id: string;
        user_id: string;
        profile_id: string;
        status: string;
        enrolled_at: string;
        progress_percent: number;
        payment_id?: string | null;
      };
    }>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      throw new Error('Unauthorized. Please log in to continue.');
    }
    throw error;
  }
}

// Theme and UI Template functions
export async function getStoreThemeConfig(storeSlug?: string, previewToken?: string) {
  try {
    // Theme config should always use public endpoint
    // If no storeSlug provided, we can't fetch theme (theme is store-specific)
    if (!storeSlug) {
      return null;
    }

    const path = previewToken
      ? `/theme/public/${storeSlug}/config?preview=${encodeURIComponent(previewToken)}`
      : `/theme/public/${storeSlug}/config`;
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        themeId?: string;
        name?: string;
        primary_color?: string;
        secondary_color?: string;
        accent_color?: string;
        background_color?: string;
        dark_mode?: boolean;
        configs?: {
          primary_color?: string;
          primary_color_light?: string;
          primary_color_dark?: string;
          secondary_color?: string;
          secondary_color_light?: string;
          secondary_color_dark?: string;
          accent_color?: string;
          background_color?: string;
          background_color_light?: string;
          background_color_dark?: string;
          dark_mode?: boolean | string | null;
          background_animation_type?: string;
          background_animation_speed?: string;
          background_svg_pattern?: string;
          element_animation_style?: string;
          border_radius_style?: string;
          shadow_style?: string;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      };
    }>(path, {
      includeAuth: false, // Always use public endpoint for theme config
      tags: ['theme'],
    });
    return result.data;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      const status = (error as Error & { status?: number }).status;
      if (status !== 404 && !error.message.includes('404')) {
        console.error('Failed to fetch theme config:', error);
      }
    }
    return null;
  }
}

/**
 * Get current UI template for authenticated user
 * Uses /ui-template/current endpoint with authentication
 */
/**
 * Get current UI template for authenticated user
 * Uses http://localhost:3000/api/ui-template/current endpoint with authentication
 */
export async function getCurrentUITemplate() {
  try {
    const path = '/ui-template/current';

    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: string;
        academy_id?: string;
        blocks?: Array<{
          id: string;
          type: string;
          order: number;
          isVisible: boolean;
          config?: Record<string, unknown>;
        }>;
        template_preset?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    }>(path, {
      includeAuth: true,
    });

    // Ensure we have valid data structure
    if (!result || !result.data) {
      return null;
    }

    // Return the data object with blocks sorted by order
    const templateData = result.data;
    if (templateData.blocks && Array.isArray(templateData.blocks)) {
      templateData.blocks = templateData.blocks.sort((a, b) => a.order - b.order);
    }

    return templateData;
  } catch {
    return null;
  }
}

export async function getStoreUITemplate(storeSlug?: string, previewToken?: string) {
  try {
    // Only use public endpoint if storeSlug is provided
    // Otherwise return null to avoid authentication issues
    if (!storeSlug) {
      return null;
    }

    const path = previewToken
      ? `/ui-template/public/${storeSlug}?preview=${encodeURIComponent(previewToken)}`
      : `/ui-template/public/${storeSlug}`;
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: string;
        academy_id?: string;
        blocks?: Array<{
          id: string;
          type: string;
          order: number;
          isVisible: boolean;
          config?: Record<string, unknown>;
        }>;
        template_preset?: string;
        is_active?: boolean;
        academy_stats?: { courseCount: number; studentCount: number } | null;
      };
    }>(path, {
      includeAuth: false,
    });

    // Ensure we have valid data structure
    if (!result || !result.data) {
      return null;
    }

    // Return the data object with blocks sorted by order
    const templateData = result.data;
    if (templateData.blocks && Array.isArray(templateData.blocks)) {
      templateData.blocks = templateData.blocks.sort((a, b) => a.order - b.order);
    }

    return templateData;
  } catch (error) {
    // Log error details for debugging but don't throw
    // This is a non-critical feature, so we gracefully degrade
    if (error instanceof Error) {
      const status = (error as Error & { status?: number }).status;
      // Only log non-404 errors to avoid noise
      // 404 means store/template doesn't exist, which is acceptable
      if (status !== 404 && !error.message.includes('404')) {
        // Log with more context in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to fetch UI template for store "${storeSlug}":`, error.message);
        }
      }
    }
    // Return null to allow the app to continue with default UI
    return null;
  }
}

export interface PreviewPreset {
  id: string;
  name: string;
  blocks: Array<{
    id: string;
    type: string;
    order: number;
    isVisible: boolean;
    config?: Record<string, unknown>;
  }>;
  theme: Record<string, unknown> | null;
  academy_stats?: { courseCount: number; studentCount: number } | null;
  academy_id?: string | null;
  academy_name?: string | null;
  academy_slug?: string | null;
}

// Single template/preset by key, for the standalone /preview/blocks renderer.
// Academy scope is carried by the optional preview token.
export async function getPreviewPreset(
  key: string,
  previewToken?: string,
  draft = false,
): Promise<PreviewPreset | null> {
  try {
    const params = new URLSearchParams();
    if (previewToken) params.set('preview', previewToken);
    if (draft) params.set('draft', '1');
    const qs = params.toString();
    const path = qs
      ? `/ui-template/preset/${encodeURIComponent(key)}?${qs}`
      : `/ui-template/preset/${encodeURIComponent(key)}`;
    // Never cached: this renders the academy's unsaved draft inside the site
    // builder, so a 60s cache entry would both hide live edits and pin a
    // one-off failure (e.g. an expired preview token) for everyone reloading
    // the canvas.
    const result = await serverFetchRaw<{ data: PreviewPreset | null }>(path, {
      includeAuth: false,
      revalidate: 0,
    });
    const preset = result?.data ?? null;
    // The canvas can only render "No preview available" when this comes back
    // thin, so say WHY here — otherwise a blank site builder has no trace at all.
    if (!preset?.blocks?.length) {
      logger.warn('SitePreview', 'PresetEmpty', {
        template_key: key,
        draft: draft ? 1 : 0,
        has_token: previewToken ? 1 : 0,
        has_preset: preset ? 1 : 0,
      });
    }
    if (preset?.blocks) {
      preset.blocks = [...preset.blocks].sort((a, b) => a.order - b.order);
    }
    return preset;
  } catch (error) {
    logger.error('SitePreview', 'PresetFetchFailed', {
      template_key: key,
      draft: draft ? 1 : 0,
      has_token: previewToken ? 1 : 0,
      error_message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export interface CourseQnA {
  id: string;
  course_id: string;
  user_id: string;
  profile_id: string;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_by: number | null;
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

function isCourseQnA(value: unknown): value is CourseQnA {
  if (typeof value !== 'object' || value === null) return false;
  if (!('id' in value) || !('question' in value)) return false;
  return typeof value.id === 'string' && typeof value.question === 'string';
}

function qnaItemsFromPayload(payload: unknown): CourseQnA[] {
  if (Array.isArray(payload)) {
    return payload.filter(isCourseQnA);
  }
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray(payload.items)
  ) {
    return payload.items.filter(isCourseQnA);
  }
  return [];
}

export async function getCourseQnAs(courseId: number) {
  try {
    const result = await serverFetch<unknown>(`/courses/${courseId}/qna`, {
      includeAuth: true,
    });
    return qnaItemsFromPayload(result.data);
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return [];
    }
    throw error;
  }
}

export async function createCourseQnA(courseId: number, question: string) {
  const result = await serverFetchRaw<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
  return result.data;
}

export async function validateDiscount(data: {
  code: string;
  amount: number;
  profile_id?: string;
  academy_id?: string;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        discount_amount: number;
        final_amount: number;
        discount_code_id: string;
      };
    }>('/discounts/validate', {
      method: 'POST',
      body: JSON.stringify(data),
      includeAuth: false,
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Cart API functions for hybrid approach
export async function getCart() {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        profile_id: string;
        items: Array<{
          id: string;
          cart_id: string;
          course_id: string;
          course: CourseSummary;
          created_at: string;
        }>;
        created_at: string;
        updated_at: string;
      };
    }>('/cart', {
      method: 'GET',
    });
    return result.data;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}

export async function syncCart(
  items: Array<{
    item_type: 'COURSE' | 'PRODUCT';
    course_id?: string;
    product_id?: string;
    course_title?: string;
    product_title?: string;
    course_price?: number;
    product_price?: number;
    course_cover?: string;
    product_cover?: string;
    added_at: string;
  }>,
) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        profile_id: string;
        items: Array<{
          id: string;
          cart_id: string;
          course_id: string;
          created_at: string;
        }>;
      };
      removedItems?: Array<{
        type: string;
        id: string;
        reason: string;
      }>;
    }>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addToCart(course_id: string) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        cart_id: string;
        course_id: string;
        created_at: string;
      };
    }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ course_id }),
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function removeFromCart(cart_item_id: number) {
  try {
    await serverFetchRaw<{
      message: string;
      status: string;
    }>(`/cart/items/${cart_item_id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function clearCart() {
  try {
    await serverFetchRaw<{
      message: string;
      status: string;
    }>('/cart', {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function createBasket(data: {
  profile_id: string;
  course_ids: string[];
  voucher_code?: string;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        profile_id: string;
        total_amount: number;
        discount_amount: number;
        final_amount: number;
        voucher_code?: string;
        items: Array<{
          course_id: string;
          course_price: number;
        }>;
        created_at: string;
      };
    }>('/baskets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

export type AcademyContactChannel =
  | 'phone'
  | 'email'
  | 'address'
  | 'website'
  | 'instagram'
  | 'telegram'
  | 'whatsapp'
  | 'linkedin'
  | 'youtube'
  | 'twitter'
  | 'aparat'
  | 'eitaa';

export type AcademyContactLink = {
  type: AcademyContactChannel;
  value: string;
  label: string | null;
};

export type AcademyStaticPage = {
  slug: 'about' | 'contact';
  title: string;
  body: string;
  is_published: boolean;
  updated_at: string | null;
};

export type AcademySiteContent = {
  academy_name: string;
  pages: AcademyStaticPage[];
  links: AcademyContactLink[];
};

/**
 * The manager-authored About/Contact content plus the academy's public contact
 * channels. Read by both static pages and the footer on the same render, so it
 * is cached per request.
 *
 * Returns `null` when the academy has no such content or the backend is
 * unreachable — the footer degrades to no social row, the pages to a 404.
 */
export const getAcademySiteContent = cache(
  async (slug: string): Promise<AcademySiteContent | null> => {
    if (!slug) return null;
    try {
      const result = await serverFetchRaw<{
        status: string;
        data: AcademySiteContent;
      }>(`/academy-site/public?slug=${encodeURIComponent(slug)}`, {
        includeAuth: false,
      });
      return result.data ?? null;
    } catch {
      return null;
    }
  },
);
