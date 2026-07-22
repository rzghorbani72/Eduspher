import "server-only";

import { cookies, headers as nextHeaders } from "next/headers";

import { getBackendApiBaseUrl, env } from "@/lib/env";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

/**
 * Custom error class for 401 Unauthorized errors
 * Used to trigger redirects to login in protected routes
 */
export class UnauthorizedError extends Error {
  status: number;
  redirectTo: string;

  constructor(message: string, redirectTo: string = "/auth/login") {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
    this.redirectTo = redirectTo;
  }
}

const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof UnauthorizedError) return true;
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status?: number }).status === 401;
  }
  return error instanceof Error && /401/.test(error.message);
};

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
  Pagination,
} from "@/lib/api/types";

type FetchOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  includeAuth?: boolean;
};

const buildUrl = (
  path: string,
  query?: FetchOptions["query"],
  lang: string = DEFAULT_LANGUAGE
) => {
  const cleanedPath = path.replace(/^\//, "");
  const baseRoot = getBackendApiBaseUrl(lang);
  const base = baseRoot.endsWith("/") ? baseRoot : `${baseRoot}/`;
  const url = new URL(cleanedPath, base);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const buildHeaders = async (
  includeAuth: boolean,
  initHeaders?: HeadersInit
): Promise<HeadersInit> => {
  const headers = new Headers(initHeaders);
  const headerStore = await nextHeaders();
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const cookieStore = await cookies();
  const headerAcademyId =
    headerStore?.get?.("x-academy-id") ?? headerStore?.get?.("X-Academy-ID") ?? null;
  const headerAcademySlug =
    headerStore?.get?.("x-academy-slug") ?? headerStore?.get?.("X-Academy-Slug") ?? null;
  const cookieAcademyId = cookieStore.get(env.academyIdCookie)?.value;
  const cookieAcademySlug = cookieStore.get(env.academySlugCookie)?.value;
  const resolvedAcademySlug =
    headerAcademySlug ?? cookieAcademySlug ?? env.defaultAcademySlug ?? null;
  const resolvedAcademyId =
    headerAcademyId ??
    cookieAcademyId ??
    (resolvedAcademySlug ? null : env.defaultAcademyId ? String(env.defaultAcademyId) : null);
  if (resolvedAcademyId && !headers.has("X-Academy-ID")) {
    headers.set("X-Academy-ID", resolvedAcademyId);
  }
  if (resolvedAcademySlug && !headers.has("X-Academy-Slug")) {
    headers.set("X-Academy-Slug", resolvedAcademySlug);
  }
  const proto =
    headerStore?.get?.("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const forwardedHost =
    headerStore?.get?.("x-forwarded-host") ?? headerStore?.get?.("host") ?? null;
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? null;
  const isInternalHost = (host: string) => {
    const hostname = host.split(":")[0];
    return (
      /^(10\.|192\.168\.|127\.)/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      hostname.includes(".svc") ||
      hostname.includes(".cluster.local")
    );
  };
  if (!headers.has("Referer")) {
    if (forwardedHost && !isInternalHost(forwardedHost)) {
      headers.set("Referer", `${proto}://${forwardedHost}`);
    } else if (publicAppUrl) {
      headers.set("Referer", publicAppUrl);
    }
  }
  // Do not set Origin on server-side fetch — in K8s, Host can be a pod IP and breaks API CORS.
  if (includeAuth) {
    const token = cookieStore.get("jwt")?.value;
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
};

const baseFetch = async (
  path: string,
  { query, includeAuth = true, ...init }: FetchOptions = {}
) => {
  const cookieStore = await cookies();
  const lang =
    cookieStore.get("preferred_language")?.value ?? DEFAULT_LANGUAGE;
  const url = buildUrl(path, query, lang);
  const headers = await buildHeaders(includeAuth, init.headers);

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    // Handle 401 specifically - only throw UnauthorizedError for account/profile endpoints
    // Other endpoints (theme, template, courses, etc.) should fail gracefully
    if (response.status === 401) {
      // Check if this is an account/profile-related endpoint
      const isAccountOrProfileEndpoint = path.includes('/auth/me') || 
                                         path.includes('/auth/profiles') || 
                                         path.includes('/enrollments') ||
                                         path.includes('/account');
      
      if (isAccountOrProfileEndpoint) {
        // Get store context to build proper login path
        const cookieStore = await cookies();
        const headerStore = await nextHeaders();
        const cookieAcademySlug = cookieStore.get(env.academySlugCookie)?.value;
        const headerAcademySlug = headerStore?.get?.("x-academy-slug") ?? null;
        const isSubdomain = headerStore?.get?.("x-academy-subdomain") === "1";
        const storeSlug =
          headerAcademySlug ?? cookieAcademySlug ?? env.defaultAcademySlug ?? null;

        // In subdomain mode the slug is already in the hostname — paths must be bare
        const loginPath = !isSubdomain && storeSlug ? `/${storeSlug}/auth/login` : "/auth/login";
        
        throw new UnauthorizedError(`Unauthorized (401): ${response.statusText}`, loginPath);
      }
      // For non-account/profile endpoints, just throw a regular error (no redirect)
    }
    
    // Try to extract error message from response body
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          if (typeof errorData === "object" && errorData !== null) {
            if ("message" in errorData && typeof errorData.message === "string") {
              errorMessage = errorData.message;
            } else if ("error" in errorData) {
              if (typeof errorData.error === "string") {
                errorMessage = errorData.error;
              } else if (typeof errorData.error === "object" && errorData.error !== null) {
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
    
    const message = `API request failed: ${errorMessage}`;
    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response;
};

async function serverFetch<T>(
  path: string,
  config?: FetchOptions
): Promise<ApiEnvelope<T>> {
  const response = await baseFetch(path, config);
  return response.json();
}

const serverFetchRaw = async <T>(
  path: string,
  config?: FetchOptions
): Promise<T> => {
  const response = await baseFetch(path, config);
  return response.json() as Promise<T>;
};

export async function getAcademiesPublic() {
  const result = await serverFetch<StoreSummary[]>("/academies/public", {
    includeAuth: false,
  });
  return result.data;
}

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    const result = await serverFetch<CategorySummary[]>("/categories", {
      includeAuth: false,
    });
    if (!result || result.status !== "ok" || !Array.isArray(result.data)) {
      return [];
    }
    return result.data;
  } catch {
    return [];
  }
}

export async function getArticles() {
  const result = await serverFetch<ArticleSummary[]>("/articles", {
    includeAuth: false,
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
  category_id?: number;
  academy_id?: string;
}) {
  try {
    const result = await serverFetch<CourseListPayload>("/courses", {
      query: {
        ...params,
      },
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<CourseListPayload>("/courses/public", {
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
  try {
    const result = await serverFetch<CourseSummary>(`/courses/${id}`);
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<CourseSummary>(`/courses/public/${id}`, {
        includeAuth: false,
      }).catch(() => null);
      return fallback?.data ?? null;
    }
    throw error;
  }
}

export async function getArticleById(id: string | number) {
  const result = await serverFetch<ArticleSummary>(`/articles/${id}`, {
    includeAuth: false,
  });
  return result.data;
}

export async function getCurrentAcademy() {
  try {
    const result = await serverFetch<StoreDetail>("/academies/current");
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function getAcademyBySlug(slug: string): Promise<StoreSummary | null> {
  try {
    const result = await serverFetchRaw<{ status: string; data: StoreSummary[] }>("/academies/public", {
      includeAuth: false,
    });
    const academies = result.data || [];
    const academy = academies.find((s) => s.slug === slug);
    return academy || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: {
        id: number;
        email: string | null;
        phone_number: string | null;
        display_name: string;
        has_password: boolean;
        last_login: Date | null;
        login_count: number;
        academyId: number;
        role: string;
        email_confirmed: boolean;
        phone_confirmed: boolean;
        isActive: boolean;
        isVerified: boolean;
        currentAcademy: {
          id: number;
          name: string;
          slug: string;
          domain: string | null;
          currency: string;
          currency_symbol: string;
        } | null;
        permissions: string[];
      };
    }>("/auth/me");
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
    return await serverFetchRaw<PublicPlan[]>("/platform-settings/plans/active", {
      includeAuth: false,
    });
  } catch {
    return [];
  }
}

export async function getUserProfiles() {
  try {
    const result = await serverFetchRaw<UserProfilesResponse>("/auth/profiles", {
      method: "POST",
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
        enrollments: Array<
          EnrollmentSummary & { Course?: EnrollmentSummary["course"] }
        >;
        pagination: Pagination;
      };
    }>("/enrollments", {
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
  course_id: number;
  user_id: number;
  profile_id: number;
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
        id: number;
        course_id: number;
        user_id: number;
        profile_id: number;
        amount: number;
        currency: string;
        status: string;
        payment_method: string;
        gateway_id?: string | null;
        coupon_code?: string | null;
        created_at: string;
      };
    }>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      throw new Error("Unauthorized. Please log in to continue.");
    }
    throw error;
  }
}

export async function initiateCheckoutPayment(data: {
  course_id: number;
  amount: number;
  coupon_code?: string;
  mobile?: string;
  provider?: "PAYPING" | "SAMAN_SEP";
}) {
  const headerStore = await nextHeaders();
  const proto =
    headerStore?.get?.("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const host = headerStore?.get?.("host");
  const fallbackBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const baseUrl = host ? `${proto}://${host}` : fallbackBaseUrl;

  const payload = {
    ...data,
    callback_url: `${baseUrl}/payment/callback`,
  };

  const result = await serverFetchRaw<{
    status: string;
    data: {
      payment_id: number;
      amount: number;
      redirect_url: string;
    };
  }>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function getAcademyPlansPublic(kind?: "SUBSCRIPTION" | "PACKAGE") {
  const result = await serverFetchRaw<{
    status: string;
    data: Array<{
      id: string;
      kind: "SUBSCRIPTION" | "PACKAGE";
      name: string;
      description: string | null;
      price: number;
      currency: string;
      duration_days: number | null;
      AcademyPlanCourse: Array<{ Course: { id: string; title: string } }>;
    }>;
  }>(`/academy-plans/public${kind ? `?kind=${kind}` : ""}`, {
    method: "GET",
  });
  return result.data ?? [];
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
}

export async function getTutoringOffersPublic(courseId: string): Promise<PublicTutoringOffer[]> {
  const result = await serverFetchRaw<{
    status: string;
    data: PublicTutoringOffer[];
  }>(`/tutoring/offers/public?course_id=${encodeURIComponent(courseId)}`, {
    method: "GET",
  });
  return result.data ?? [];
}

export type PublicOfferingType =
  | "FREE"
  | "ONE_TIME"
  | "SUBSCRIPTION"
  | "PRIVATE"
  | "PAYMENT_PLAN";

export interface PublicCourseOffering {
  id: string;
  course_id: string;
  type: PublicOfferingType;
  price: number;
  currency: string;
  access_duration_days: number | null;
  is_active: boolean;
}

// Storefront: active offerings for a course. The endpoint returns the array
// directly (no envelope).
export async function getCourseOfferingsPublic(
  courseId: string
): Promise<PublicCourseOffering[]> {
  const result = await serverFetchRaw<PublicCourseOffering[]>(
    `/course-offerings/course/${encodeURIComponent(courseId)}`,
    { method: "GET" }
  );
  return Array.isArray(result) ? result : [];
}

export async function initiateAcademyPlanPayment(data: {
  academy_plan_id: string;
  amount: number;
  coupon_code?: string;
  mobile?: string;
}) {
  const headerStore = await nextHeaders();
  const proto =
    headerStore?.get?.("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const host = headerStore?.get?.("host");
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const baseUrl = host ? `${proto}://${host}` : fallbackBaseUrl;

  const result = await serverFetchRaw<{
    status: string;
    data: { payment_id: string; amount: number; redirect_url: string };
  }>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      callback_url: `${baseUrl}/payment/callback`,
    }),
  });

  return result.data;
}

export async function createEnrollment(data: {
  course_id: number;
  user_id: number;
  profile_id: number;
  payment_id?: number;
  status?: string;
  progress_percent?: number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: number;
        course_id: number;
        user_id: number;
        profile_id: number;
        status: string;
        enrolled_at: string;
        progress_percent: number;
        payment_id?: number | null;
      };
    }>("/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      throw new Error("Unauthorized. Please log in to continue.");
    }
    throw error;
  }
}

// Theme and UI Template functions
export async function getStoreThemeConfig(
  storeSlug?: string,
  previewToken?: string,
) {
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
        themeId?: number;
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
    const path = "/ui-template/current";

    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: number;
        academy_id?: number;
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

export async function getStoreUITemplate(
  storeSlug?: string,
  previewToken?: string,
) {
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
        id?: number;
        academy_id?: number;
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
          console.error(
            `Failed to fetch UI template for store "${storeSlug}":`,
            error.message
          );
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
    if (previewToken) params.set("preview", previewToken);
    if (draft) params.set("draft", "1");
    const qs = params.toString();
    const path = qs
      ? `/ui-template/preset/${encodeURIComponent(key)}?${qs}`
      : `/ui-template/preset/${encodeURIComponent(key)}`;
    const result = await serverFetchRaw<{ data: PreviewPreset | null }>(path, {
      includeAuth: false,
    });
    const preset = result?.data ?? null;
    if (preset?.blocks) {
      preset.blocks = [...preset.blocks].sort((a, b) => a.order - b.order);
    }
    return preset;
  } catch {
    return null;
  }
}

export interface CourseQnA {
  id: number;
  course_id: number;
  user_id: number;
  profile_id: number;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_by: number | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
  profile?: {
    id: number;
    display_name: string;
  };
  answerer?: {
    id: number;
    display_name: string;
  } | null;
}

export async function getCourseQnAs(courseId: number) {
  try {
    const result = await serverFetch<CourseQnA[]>(`/courses/${courseId}/qna`, {
      includeAuth: true,
    });
    return result.data ?? [];
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
  profile_id?: number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        discount_amount: number;
        final_amount: number;
        discount_code_id: number;
      };
    }>("/discounts/validate", {
      method: "POST",
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
        id: number;
        profile_id: number;
        items: Array<{
          id: number;
          cart_id: number;
          course_id: number;
          course: CourseSummary;
          created_at: string;
        }>;
        created_at: string;
        updated_at: string;
      };
    }>("/cart", {
      method: "GET",
    });
    return result.data;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}

export async function syncCart(items: Array<{
  item_type: 'COURSE' | 'PRODUCT';
  course_id?: number;
  product_id?: number;
  course_title?: string;
  product_title?: string;
  course_price?: number;
  product_price?: number;
  course_cover?: string;
  product_cover?: string;
  added_at: string;
}>) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: number;
        profile_id: number;
        items: Array<{
          id: number;
          cart_id: number;
          course_id: number;
          created_at: string;
        }>;
      };
      removedItems?: Array<{
        type: string;
        id: number;
        reason: string;
      }>;
    }>("/cart/sync", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addToCart(course_id: number) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: number;
        cart_id: number;
        course_id: number;
        created_at: string;
      };
    }>("/cart/items", {
      method: "POST",
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
      method: "DELETE",
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
    }>("/cart", {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function createBasket(data: {
  profile_id: number;
  course_ids: number[];
  voucher_code?: string;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: number;
        profile_id: number;
        total_amount: number;
        discount_amount: number;
        final_amount: number;
        voucher_code?: string;
        items: Array<{
          course_id: number;
          course_price: number;
        }>;
        created_at: string;
      };
    }>("/baskets", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

