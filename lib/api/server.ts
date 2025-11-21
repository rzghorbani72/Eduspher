import "server-only";

import { cookies, headers as nextHeaders } from "next/headers";

import { backendApiBaseUrl, env } from "@/lib/env";
import type {
  ApiEnvelope,
  ArticleSummary,
  CategorySummary,
  CourseListPayload,
  CourseSummary,
  SchoolDetail,
  SchoolSummary,
  UserProfilesResponse,
  EnrollmentSummary,
  Pagination,
} from "@/lib/api/types";

type FetchOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  includeAuth?: boolean;
};

const buildUrl = (path: string, query?: FetchOptions["query"]) => {
  const cleanedPath = path.replace(/^\//, "");
  const base = backendApiBaseUrl.endsWith("/")
    ? backendApiBaseUrl
    : `${backendApiBaseUrl}/`;
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
  const headerSchoolId = headerStore?.get?.("x-school-id") ?? null;
  const headerSchoolSlug = headerStore?.get?.("x-school-slug") ?? null;
  const cookieSchoolId = cookieStore.get(env.schoolIdCookie)?.value;
  const cookieSchoolSlug = cookieStore.get(env.schoolSlugCookie)?.value;
  const resolvedSchoolId = headerSchoolId ?? cookieSchoolId ?? (env.defaultSchoolId ? String(env.defaultSchoolId) : null);
  const resolvedSchoolSlug = headerSchoolSlug ?? cookieSchoolSlug ?? env.defaultSchoolSlug ?? null;
  if (resolvedSchoolId && !headers.has("X-School-ID")) {
    headers.set("X-School-ID", resolvedSchoolId);
  }
  if (resolvedSchoolSlug && !headers.has("X-School-Slug")) {
    headers.set("X-School-Slug", resolvedSchoolSlug);
  }
  const proto = headerStore?.get?.("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  const host = headerStore?.get?.("host") ?? null;
  if (host && !headers.has("Referer")) {
    headers.set("Referer", `${proto}://${host}`);
  }
  if (host && !headers.has("Origin")) {
    headers.set("Origin", `${proto}://${host}`);
  }
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
  const url = buildUrl(path, query);
  const headers = await buildHeaders(includeAuth, init.headers);

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    // Handle 401 specifically - this will be caught by middleware for redirect
    if (response.status === 401) {
      const error = new Error(`Unauthorized (401): ${response.statusText}`);
      (error as any).status = 401;
      throw error;
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
    (error as any).status = response.status;
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

export async function getSchoolsPublic() {
  const result = await serverFetch<SchoolSummary[]>("/schools/public", {
    includeAuth: false,
  });
  return result.data;
}

export async function getCategories() {
  const result = await serverFetch<CategorySummary[]>("/categories", {
    includeAuth: false,
  });
  return result.data;
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

export async function getCurrentSchool() {
  try {
    const result = await serverFetch<SchoolDetail>("/schools/current");
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: {
        id: number;
        email: string;
        phone_number: string;
        name: string;
        country_code?: string;
        preferred_currency?: string;
        currentProfile: {
          id: number;
          schoolId: number;
          role: string;
          displayName: string;
          isActive: boolean;
          isVerified: boolean;
        };
        currentSchool: {
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
  course_id?: number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        enrollments: EnrollmentSummary[];
        pagination: Pagination;
      };
    }>("/enrollments", {
      query: {
        ...params,
      },
    });
    return result.data;
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
export async function getSchoolThemeConfig(schoolSlug?: string) {
  try {
    const path = schoolSlug 
      ? `/theme/public/${schoolSlug}/config`
      : "/theme/current/config";
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
        [key: string]: any;
      };
    }>(path, {
      includeAuth: false,
    });
    return result.data;
  } catch (error) {
    console.error("Failed to fetch theme config:", error);
    return null;
  }
}

export async function getSchoolUITemplate(schoolSlug?: string) {
  try {
    // Only use public endpoint if schoolSlug is provided
    // Otherwise return null to avoid authentication issues
    if (!schoolSlug) {
      return null;
    }

    const path = `/ui-template/public/${schoolSlug}`;
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: number;
        school_id?: number;
        blocks?: Array<{
          id: string;
          type: string;
          order: number;
          isVisible: boolean;
          config?: Record<string, any>;
        }>;
        template_preset?: string;
        is_active?: boolean;
      };
    }>(path, {
      includeAuth: false,
    });
    return result.data;
  } catch (error) {
    // Log error details for debugging but don't throw
    // This is a non-critical feature, so we gracefully degrade
    if (error instanceof Error) {
      const status = (error as any).status;
      // Only log non-404 errors to avoid noise
      // 404 means school/template doesn't exist, which is acceptable
      if (status !== 404 && !error.message.includes('404')) {
        // Log with more context in development
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `Failed to fetch UI template for school "${schoolSlug}":`,
            error.message
          );
        }
      }
    }
    // Return null to allow the app to continue with default UI
    return null;
  }
}

