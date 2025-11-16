"use client";

import type { AuthResponse } from "@/lib/api/types";
import { backendApiBaseUrl, env } from "@/lib/env";

const withTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const baseUrl = withTrailingSlash(backendApiBaseUrl);

type RequestOptions = {
  signal?: AbortSignal;
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("Content-Type") ?? "";
  const isJson = contentType.includes("application/json");

  // Handle unauthorized responses globally
  if (response.status === 401) {
    // In the browser, redirect to login and preserve the current path
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const schoolSlug = getCookieValue(env.schoolSlugCookie);
      const loginPath = schoolSlug ? `/${schoolSlug}/auth/login` : "/auth/login";
      if(currentPath.includes('/login')){
        return null as unknown as T;
      }
      const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }

    let errorMessage = "Unauthorized (401)";
    if (isJson) {
      try {
        const parsed = (await response.json()) as unknown;
        if (typeof parsed === "object" && parsed !== null && "message" in parsed) {
          errorMessage = String((parsed as { message?: unknown }).message ?? errorMessage);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    throw new Error(errorMessage);
  }

  if (isJson) {
    const parsed = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        typeof parsed === "object" && parsed !== null && "message" in parsed
          ? String((parsed as { message?: unknown }).message ?? "")
          : response.statusText;
      throw new Error(message || "Request failed");
    }
    return parsed as T;
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || response.statusText || "Request failed");
  }
  return text as unknown as T;
}

const postJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const schoolId = getCookieValue(env.schoolIdCookie);
  const schoolSlug = getCookieValue(env.schoolSlugCookie);
  if (schoolId) {
    headers["X-School-ID"] = schoolId;
  } else if (env.defaultSchoolId) {
    headers["X-School-ID"] = String(env.defaultSchoolId);
  }
  if (schoolSlug) {
    headers["X-School-Slug"] = schoolSlug;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  return handleResponse<T>(response);
};

const getJson = async <T>(path: string, options?: RequestOptions) => {
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    credentials: "include",
    headers,
    signal: options?.signal,
  });
  return handleResponse<T>(response);
};

export type LoginPayload = {
  identifier: string;
  password: string;
  school_id?: number;
  role?: string;
};

export const login = (payload: LoginPayload, options?: RequestOptions) => {
  // Don't filter by role for public login - allow any public role (USER, STUDENT)
  // The backend will validate the role after finding the matching profile
  return postJson<AuthResponse>("/auth/login", {
    school_id: env.defaultSchoolId,
    ...payload,
  }, options);
};

export type RegisterPayload = {
  name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirmed_password: string;
  role?: string;
  school_id?: number;
  display_name: string;
  bio?: string;
  website?: string;
  location?: string;
};

export const register = (payload: RegisterPayload, options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/register", {
    role: "USER",
    school_id: env.defaultSchoolId,
    ...payload,
  }, options);
};

export const logout = (options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/logout", {}, options);
};

export const me = (options?: RequestOptions) => {
  return getJson<{ id?: number; status?: string; data?: unknown }>("/auth/me", options);
};

