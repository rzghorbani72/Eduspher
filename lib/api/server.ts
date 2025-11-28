import "server-only";

import { cookies, headers as nextHeaders } from "next/headers";

import { backendApiBaseUrl, env } from "@/lib/env";

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
import type {
  ApiEnvelope,
  ArticleSummary,
  CategorySummary,
  CourseListPayload,
  CourseSummary,
  ProductListPayload,
  ProductSummary,
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
    // Handle 401 specifically - only throw UnauthorizedError for account/profile endpoints
    // Other endpoints (theme, template, courses, etc.) should fail gracefully
    if (response.status === 401) {
      // Check if this is an account/profile-related endpoint
      const isAccountOrProfileEndpoint = path.includes('/auth/me') || 
                                         path.includes('/auth/profiles') || 
                                         path.includes('/enrollments') ||
                                         path.includes('/account');
      
      if (isAccountOrProfileEndpoint) {
        // Get school context to build proper login path
        const cookieStore = await cookies();
        const headerStore = await nextHeaders();
        const cookieSchoolSlug = cookieStore.get(env.schoolSlugCookie)?.value;
        const headerSchoolSlug = headerStore?.get?.("x-school-slug") ?? null;
        const schoolSlug = headerSchoolSlug ?? cookieSchoolSlug ?? env.defaultSchoolSlug ?? null;
        
        const loginPath = schoolSlug ? `/${schoolSlug}/auth/login` : "/auth/login";
        
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

export async function getProducts(params?: {
  search?: string;
  title?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  order_by?: string;
  published?: boolean;
  is_featured?: boolean;
  product_type?: 'DIGITAL' | 'PHYSICAL';
  category_id?: number;
  author_id?: number;
  course_id?: number;
}) {
  try {
    const result = await serverFetch<ProductListPayload>("/products", {
      query: {
        ...params,
      },
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<ProductListPayload>("/products/public", {
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

export async function getProductById(id: string | number) {
  try {
    const result = await serverFetch<ProductSummary>(`/products/${id}`);
    return result;
  } catch (error) {
    if (error instanceof Error && (/401|404/.test(error.message))) {
      const fallback = await serverFetch<ProductSummary>(`/products/public/${id}`, {
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
  return result;
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

export async function getSchoolBySlug(slug: string): Promise<SchoolSummary | null> {
  try {
    const result = await serverFetchRaw<{ status: string; data: SchoolSummary[] }>("/schools/public", {
      includeAuth: false,
    });
    const schools = result.data || [];
    const school = schools.find((s) => s.slug === slug);
    return school || null;
  } catch (error) {
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
        schoolId: number;
        role: string;
        email_confirmed: boolean;
        phone_confirmed: boolean;
        isActive: boolean;
        isVerified: boolean;
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
    // Theme config should always use public endpoint
    // If no schoolSlug provided, we can't fetch theme (theme is school-specific)
    if (!schoolSlug) {
      return null;
    }

    const path = `/theme/public/${schoolSlug}/config`;
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
      includeAuth: false, // Always use public endpoint for theme config
    });
    return result.data;
  } catch (error) {
    // Theme config is not critical - fail gracefully without throwing
    // Don't log 401/404 errors as they're expected in some cases
    if (error instanceof UnauthorizedError) {
      // Theme config should never require auth, but if it does, just return null
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.error("Failed to fetch theme config:", error);
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
  } catch (error) {
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
    if (error instanceof Error && /401/.test(error.message)) {
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
    }>("/cart/sync", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
    return result.data;
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

