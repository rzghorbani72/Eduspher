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
  const headerStoreId = headerStore?.get?.("x-store-id") ?? null;
  const headerStoreSlug = headerStore?.get?.("x-store-slug") ?? null;
  const cookieStoreId = cookieStore.get(env.storeIdCookie)?.value;
  const cookieStoreSlug = cookieStore.get(env.storeSlugCookie)?.value;
  const resolvedStoreId = headerStoreId ?? cookieStoreId ?? (env.defaultStoreId ? String(env.defaultStoreId) : null);
  const resolvedStoreSlug = headerStoreSlug ?? cookieStoreSlug ?? env.defaultStoreSlug ?? null;
  if (resolvedStoreId && !headers.has("X-Store-ID")) {
    headers.set("X-Store-ID", resolvedStoreId);
  }
  if (resolvedStoreSlug && !headers.has("X-Store-Slug")) {
    headers.set("X-Store-Slug", resolvedStoreSlug);
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
        // Get store context to build proper login path
        const cookieStore = await cookies();
        const headerStore = await nextHeaders();
        const cookieStoreSlug = cookieStore.get(env.storeSlugCookie)?.value;
        const headerStoreSlug = headerStore?.get?.("x-store-slug") ?? null;
        const storeSlug = headerStoreSlug ?? cookieStoreSlug ?? env.defaultStoreSlug ?? null;
        
        const loginPath = storeSlug ? `/${storeSlug}/auth/login` : "/auth/login";
        
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

export async function getStoresPublic() {
  const result = await serverFetch<StoreSummary[]>("/stores/public", {
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

export async function getCurrentStore() {
  try {
    const result = await serverFetch<StoreDetail>("/stores/current");
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function getStoreBySlug(slug: string): Promise<StoreSummary | null> {
  try {
    const result = await serverFetchRaw<{ status: string; data: StoreSummary[] }>("/stores/public", {
      includeAuth: false,
    });
    const stores = result.data || [];
    const store = stores.find((s) => s.slug === slug);
    return store || null;
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
        storeId: number;
        role: string;
        email_confirmed: boolean;
        phone_confirmed: boolean;
        isActive: boolean;
        isVerified: boolean;
        currentStore: {
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
export async function getStoreThemeConfig(storeSlug?: string) {
  try {
    // Theme config should always use public endpoint
    // If no storeSlug provided, we can't fetch theme (theme is store-specific)
    if (!storeSlug) {
      return null;
    }

    const path = `/theme/public/${storeSlug}/config`;
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
          [key: string]: any;
        };
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
        store_id?: number;
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

export async function getStoreUITemplate(storeSlug?: string) {
  try {
    // Only use public endpoint if storeSlug is provided
    // Otherwise return null to avoid authentication issues
    if (!storeSlug) {
      return null;
    }

    const path = `/ui-template/public/${storeSlug}`;
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: number;
        store_id?: number;
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

