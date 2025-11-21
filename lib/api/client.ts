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

  // Check if response is not in 2xx range
  if (!response.ok) {
    let errorMessage = response.statusText || "Request failed";

    if (isJson) {
      try {
        const parsed = (await response.json()) as unknown;
        if (typeof parsed === "object" && parsed !== null) {
          // Try to extract error message from various possible fields
          if ("message" in parsed && typeof parsed.message === "string") {
            errorMessage = parsed.message;
          } else if ("error" in parsed && typeof parsed.error === "string") {
            errorMessage = parsed.error;
          } else if ("error" in parsed && typeof parsed.error === "object" && parsed.error !== null) {
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

    // Handle 401 specifically - don't redirect if already on login page
    if (response.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const schoolSlug = getCookieValue(env.schoolSlugCookie);
      const loginPath = schoolSlug ? `/${schoolSlug}/auth/login` : "/auth/login";
      if (!currentPath.includes('/login')) {
        const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
        return null as unknown as T;
      }
    }

    throw new Error(errorMessage);
  }

  // Response is successful (2xx), parse and return
  if (isJson) {
    const parsed = (await response.json()) as unknown;
    return parsed as T;
  }

  const text = await response.text();
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

export const login = async (payload: LoginPayload, options?: RequestOptions) => {
  // Use API route to proxy the request and forward Set-Cookie headers
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

  const response = await fetch(`/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      school_id: env.defaultSchoolId,
      ...payload,
    }),
    signal: options?.signal,
  });

  return handleResponse<AuthResponse>(response);
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

export const register = async (payload: RegisterPayload, options?: RequestOptions) => {
  // Use API route to proxy the request and forward Set-Cookie headers
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

  const response = await fetch(`/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      role: "USER",
      school_id: env.defaultSchoolId,
      ...payload,
    }),
    signal: options?.signal,
  });

  return handleResponse<AuthResponse>(response);
};

export const logout = async (options?: RequestOptions) => {
  // Use API route to proxy the request and forward Set-Cookie headers
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

  const response = await fetch(`/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({}),
    signal: options?.signal,
  });

  return handleResponse<AuthResponse>(response);
};

export const me = (options?: RequestOptions) => {
  return getJson<{ id?: number; status?: string; data?: unknown }>("/auth/me", options);
};

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
  school_id?: number;
};

export const sendEmailOtp = (email: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string }>("/auth/otp/send-email", {
    email,
    type,
  }, options);
};

export const sendPhoneOtp = (phone_number: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string }>("/auth/otp/send-phone", {
    phone_number,
    type,
  }, options);
};

export const verifyEmailOtp = (email: string, otp: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; success?: boolean }>("/auth/otp/verify-email", {
    email,
    otp,
  }, options);
};

export const verifyPhoneOtp = (phone_number: string, otp: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; success?: boolean }>("/auth/otp/verify-phone", {
    phone_number,
    otp,
  }, options);
};

export const forgetPassword = (payload: ForgetPasswordPayload, options?: RequestOptions) => {
  return postJson<{ message: string; status: string }>("/auth/forget-password", {
    ...payload,
    school_id: payload.school_id || env.defaultSchoolId,
  }, options);
};

