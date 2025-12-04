"use client";

import type { AuthResponse } from "@/lib/api/types";
import { backendApiBaseUrl, env } from "@/lib/env";

const withTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const baseUrl = withTrailingSlash(backendApiBaseUrl);

type RequestOptions = {
  signal?: AbortSignal;
  skipRefresh?: boolean; // Skip token refresh for this request
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token cookie
 */
async function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("[Auth] Token refreshed successfully");
        return true;
      }

      console.warn("[Auth] Token refresh failed:", response.status);
      return false;
    } catch (error) {
      console.error("[Auth] Token refresh error:", error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Redirect to login page
 */
function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname + window.location.search;
    const schoolSlug = getCookieValue(env.schoolSlugCookie);
    const loginPath = schoolSlug ? `/${schoolSlug}/auth/login` : "/auth/login";
    if (!currentPath.includes('/login')) {
      const redirectUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }
  }
}

async function handleResponse<T>(
  response: Response, 
  retryFn?: () => Promise<T>,
  skipRefresh?: boolean
): Promise<T> {
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

    // Handle 401 - attempt token refresh
    if (response.status === 401 && !skipRefresh && retryFn) {
      console.log("[Auth] Access token expired, attempting refresh...");
      const refreshSuccess = await refreshToken();
      
      if (refreshSuccess) {
        // Retry the original request
        return retryFn();
      }
      
      // Refresh failed - redirect to login
      redirectToLogin();
      return null as unknown as T;
    }

    // Handle 401 without retry (already retried or auth endpoint)
    if (response.status === 401) {
      redirectToLogin();
        return null as unknown as T;
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

export const postJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions
): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const schoolId = getCookieValue(env.schoolIdCookie);
  const schoolSlug = getCookieValue(env.schoolSlugCookie);
    
    // Add CSRF token for protection
    const csrfToken = getCookieValue('csrf-token');
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    
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
    
    // Skip refresh for auth endpoints
    const isAuthEndpoint = path.includes('/auth/login') || 
                           path.includes('/auth/register') ||
                           path.includes('/auth/refresh');
    
    return handleResponse<T>(
      response, 
      isAuthEndpoint ? undefined : () => makeRequest(true),
      skipRefresh || isAuthEndpoint
    );
  };
  
  return makeRequest(options?.skipRefresh);
};

const getJson = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    credentials: "include",
    headers,
    signal: options?.signal,
  });
    return handleResponse<T>(
      response, 
      () => makeRequest(true),
      skipRefresh
    );
  };
  
  return makeRequest(options?.skipRefresh);
};

const putJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions
): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const schoolId = getCookieValue(env.schoolIdCookie);
  const schoolSlug = getCookieValue(env.schoolSlugCookie);
    
    // Add CSRF token for protection
    const csrfToken = getCookieValue('csrf-token');
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    
  if (schoolId) {
    headers["X-School-ID"] = schoolId;
  } else if (env.defaultSchoolId) {
    headers["X-School-ID"] = String(env.defaultSchoolId);
  }
  if (schoolSlug) {
    headers["X-School-Slug"] = schoolSlug;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });
    return handleResponse<T>(
      response, 
      () => makeRequest(true),
      skipRefresh
    );
  };
  
  return makeRequest(options?.skipRefresh);
};

const patchJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions
): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const schoolId = getCookieValue(env.schoolIdCookie);
  const schoolSlug = getCookieValue(env.schoolSlugCookie);
    
    // Add CSRF token for protection
    const csrfToken = getCookieValue('csrf-token');
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    
  if (schoolId) {
    headers["X-School-ID"] = schoolId;
  } else if (env.defaultSchoolId) {
    headers["X-School-ID"] = String(env.defaultSchoolId);
  }
  if (schoolSlug) {
    headers["X-School-Slug"] = schoolSlug;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });
    return handleResponse<T>(
      response, 
      () => makeRequest(true),
      skipRefresh
    );
  };
  
  return makeRequest(options?.skipRefresh);
};

const deleteJson = async <T>(
  path: string,
  options?: RequestOptions
): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
    const headers: HeadersInit = {
      Accept: "application/json",
    };
    const schoolId = getCookieValue(env.schoolIdCookie);
    const schoolSlug = getCookieValue(env.schoolSlugCookie);
    
    // Add CSRF token for protection
    const csrfToken = getCookieValue('csrf-token');
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    
    if (schoolId) {
      headers["X-School-ID"] = schoolId;
    } else if (env.defaultSchoolId) {
      headers["X-School-ID"] = String(env.defaultSchoolId);
    }
    if (schoolSlug) {
      headers["X-School-Slug"] = schoolSlug;
    }
    const response = await fetch(`${baseUrl}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers,
      signal: options?.signal,
    });
    return handleResponse<T>(
      response, 
      () => makeRequest(true),
      skipRefresh
    );
  };
  
  return makeRequest(options?.skipRefresh);
};

export type LoginPayload = {
  identifier: string;
  password: string;
  school_id?: number;
  role?: string;
};

export const login = async (payload: LoginPayload, options?: RequestOptions) => {
  const schoolId = getCookieValue(env.schoolIdCookie);
  const finalSchoolId = schoolId ? Number(schoolId) : env.defaultSchoolId;
  
  return postJson<AuthResponse>("/auth/login", {
    ...payload,
    school_id: finalSchoolId,
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

export const register = async (payload: RegisterPayload, options?: RequestOptions) => {
  const schoolId = getCookieValue(env.schoolIdCookie);
  const finalSchoolId = schoolId ? Number(schoolId) : env.defaultSchoolId;
  
  return postJson<AuthResponse>("/auth/register", {
    role: "USER",
    school_id: finalSchoolId,
    ...payload,
  }, options);
};

export const logout = async (options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/logout", {}, options);
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

export const validatePhoneAndEmail = (phone_number?: string, email?: string, options?: RequestOptions) => {
  return postJson<{ success: boolean; message: string; phone_number: string; email: string }>("/auth/otp/validate-phone-email", {
    ...(phone_number ? { phone_number } : {}),
    ...(email ? { email } : {}),
  }, options);
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

export const changePassword = (payload: {
  profile_id: number;
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; success?: boolean }>("/auth/change-password", payload, options);
};

export const updateProfile = async (
  profileId: number,
  data: { display_name?: string; image_id?: number },
  options?: RequestOptions
) => {
  const response = await patchJson<{
    message: string;
    status: string;
    data: {
      id: number;
      display_name: string;
      avatar?: {
        id: number;
        filename: string;
        url: string;
      };
    };
  }>(`/profiles/${profileId}`, data, options);
  return response.data;
};

export const updateSchool = async (
  data: { name?: string; description?: string },
  options?: RequestOptions
) => {
  const response = await patchJson<{
    message: string;
    status: string;
    data: {
      id: number;
      name: string;
      description?: string;
    };
  }>("/schools/current", data, options);
  return response.data;
};

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

export const getCourseQnAs = async (courseId: number, options?: RequestOptions) => {
  const response = await getJson<{
    message: string;
    status: string;
    data: CourseQnA[];
  }>(`/courses/${courseId}/qna`, options);
  return response.data ?? [];
};

export const createCourseQnA = async (
  courseId: number,
  question: string,
  options?: RequestOptions
) => {
  const response = await postJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna`, { question }, options);
  return response.data;
};

export const approveCourseQnA = async (
  courseId: number,
  qnaId: number,
  isApproved: boolean,
  options?: RequestOptions
) => {
  const response = await putJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna/${qnaId}/approve`, { is_approved: isApproved }, options);
  return response.data;
};

export const answerCourseQnA = async (
  courseId: number,
  qnaId: number,
  answer: string,
  options?: RequestOptions
) => {
  const response = await putJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna/${qnaId}/answer`, { answer }, options);
  return response.data;
};

// ============================================================================
// SESSION MANAGEMENT APIs
// ============================================================================

export interface ActiveSession {
  id: number;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  is_current: boolean;
}

/**
 * Get all active sessions for the current user
 */
export const getActiveSessions = async (options?: RequestOptions) => {
  const response = await getJson<{
    success: boolean;
    sessions: ActiveSession[];
  }>("/auth/sessions", options);
  return response.sessions ?? [];
};

/**
 * Revoke a specific session by ID
 */
export const revokeSession = async (sessionId: number, options?: RequestOptions) => {
  return deleteJson<{
    success: boolean;
    message: string;
  }>(`/auth/sessions/${sessionId}`, options);
};

/**
 * Logout from all devices (revoke all sessions)
 */
export const logoutAllDevices = async (options?: RequestOptions) => {
  return postJson<{
    message: string;
    revokedCount: number;
  }>("/auth/logout-all", {}, options);
};

