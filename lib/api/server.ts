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
  console.log("url", url);
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const message = `API request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
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
  title?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  order_by?: string;
  published?: boolean;
  is_featured?: boolean;
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

