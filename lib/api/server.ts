import "server-only";

import { cookies } from "next/headers";

import { backendApiBaseUrl, env } from "@/lib/env";
import type {
  ApiEnvelope,
  ArticleSummary,
  CategorySummary,
  CourseListPayload,
  CourseSummary,
  SchoolSummary,
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
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (includeAuth) {
    const token = cookies().get("jwt")?.value;
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
};

async function serverFetch<T>(
  path: string,
  { query, includeAuth = true, ...init }: FetchOptions = {}
): Promise<ApiEnvelope<T>> {
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
    const message = `API request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}

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
}) {
  try {
    const result = await serverFetch<CourseListPayload>("/courses", {
      query: {
        school_id: env.defaultSchoolId,
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

export async function getCourseById(id: string | number) {
  try {
    const result = await serverFetch<CourseSummary>(`/courses/${id}`, {
      query: {
        school_id: env.defaultSchoolId,
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

export async function getArticleById(id: string | number) {
  const result = await serverFetch<ArticleSummary>(`/articles/${id}`, {
    includeAuth: false,
  });
  return result.data;
}

