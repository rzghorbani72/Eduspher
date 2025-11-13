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

export type LoginPayload = {
  identifier: string;
  password: string;
  school_id?: number;
  role?: string;
};

export const login = (payload: LoginPayload, options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/login", {
    role: "USER",
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

