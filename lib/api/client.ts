"use client";

import type { AuthResponse } from "@/lib/api/types";
import { getClientBackendApiBaseUrl, env } from "@/lib/env";

const withTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const getBaseUrl = () => withTrailingSlash(getClientBackendApiBaseUrl());

type RequestOptions = {
  signal?: AbortSignal;
  skipRefresh?: boolean; // Skip token refresh for this request
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Academy ID from cookie or default — required for tenant-scoped API calls.
 */
const getAcademyId = (): string => {
  const academyId = getCookieValue(env.academyIdCookie);
  if (academyId) {
    return academyId;
  }
  if (env.defaultAcademyId) {
    return String(env.defaultAcademyId);
  }
  throw new Error(
    "Academy ID is required but not found in cookies or environment variables"
  );
};

const getAcademySlug = (): string | null => {
  return getCookieValue(env.academySlugCookie);
};

const buildHeaders = (additionalHeaders: HeadersInit = {}): HeadersInit => {
  const headers = new Headers(additionalHeaders);
  headers.set("X-Academy-ID", getAcademyId());

  const academySlug = getAcademySlug();
  if (academySlug) {
    headers.set("X-Academy-Slug", academySlug);
  }

  const csrfToken = getCookieValue("csrf-token");
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  return headers;
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
      const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
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
    const storeSlug = getAcademySlug();
    const loginPath = storeSlug ? `/${storeSlug}/auth/login` : "/auth/login";
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
    const headers = buildHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    
    // Skip refresh for auth endpoints
    const isAuthEndpoint = path.includes('/auth/public/login') || 
                           path.includes('/auth/staff/login') ||
                           path.includes('/auth/admin/login') ||
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

export const getJson = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
    const headers = buildHeaders({
      Accept: "application/json",
    });

    const response = await fetch(`${getBaseUrl()}${path}`, {
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
    const headers = buildHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    const response = await fetch(`${getBaseUrl()}${path}`, {
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

export const patchJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  options?: RequestOptions
): Promise<T> => {
  const makeRequest = async (skipRefresh = false): Promise<T> => {
    const headers = buildHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    const response = await fetch(`${getBaseUrl()}${path}`, {
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
    const headers = buildHeaders({
      Accept: "application/json",
    });

    const response = await fetch(`${getBaseUrl()}${path}`, {
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
  academy_id?: number;
  role?: string;
};

export const login = async (payload: LoginPayload, options?: RequestOptions) => {
  const cookieId = getCookieValue(env.academyIdCookie);
  const finalAcademyId = cookieId ? Number(cookieId) : env.defaultAcademyId;

  if (!finalAcademyId) {
    throw new Error("Academy ID is required for public login");
  }

  return postJson<AuthResponse>(
    "/auth/public/login",
    {
      ...payload,
      academy_id: payload.academy_id ?? finalAcademyId,
    },
    options
  );
};

export type AccountIdentity = {
  exists: boolean;
  channel: "phone" | "email";
  can_use_password: boolean;
  can_use_otp: boolean;
  captcha_required: boolean;
};

/**
 * Identifier-first login step 1: which sign-in methods this identifier has in
 * THIS academy. Lets an unknown visitor be sent to signup instead of failing a
 * password they never had.
 */
export const identifyAccount = async (identifier: string, options?: RequestOptions) => {
  const cookieId = getCookieValue(env.academyIdCookie);
  const finalAcademyId =
    cookieId ?? (env.defaultAcademyId != null ? String(env.defaultAcademyId) : undefined);

  if (!finalAcademyId) {
    throw new Error("Academy ID is required for login");
  }

  return postJson<AccountIdentity>(
    "/auth/public/identify",
    { identifier, academy_id: finalAcademyId },
    options
  );
};

export type RegisterPayload = {
  name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirmed_password: string;
  role?: string;
  academy_id?: number;
  display_name: string;
  bio?: string;
  website?: string;
  location?: string;
};

export const register = async (payload: RegisterPayload, options?: RequestOptions) => {
  const cookieId = getCookieValue(env.academyIdCookie);
  const finalAcademyId = cookieId ? Number(cookieId) : env.defaultAcademyId;

  return postJson<AuthResponse>("/auth/register", {
    role: "USER",
    academy_id: finalAcademyId,
    ...payload,
  }, options);
};

export const logout = async (options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/logout", {}, options);
};

export const me = (options?: RequestOptions) => {
  return getJson<{ id?: number; status?: string; data?: unknown }>("/auth/me", options);
};

export type LegalDocumentSummary = {
  type: string;
  version: string;
  title: string;
  published_at: string;
};

export const getLegalDocuments = (options?: RequestOptions) => {
  return getJson<LegalDocumentSummary[]>(`/legal/documents`, options);
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
  academy_id?: number;
};

export const validatePhoneAndEmail = (phone_number?: string, email?: string, options?: RequestOptions) => {
  return postJson<{ success: boolean; message: string; phone_number: string; email: string }>("/auth/otp/validate-phone-email", {
    ...(phone_number ? { phone_number } : {}),
    ...(email ? { email } : {}),
  }, options);
};

export const sendEmailOtp = (email: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; otp?: string }>("/auth/otp/send-email", {
    email,
    type,
  }, options);
};

export const sendPhoneOtp = (phone_number: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; otp?: string }>("/auth/otp/send-phone", {
    phone_number,
    type,
  }, options);
};

export const loginByPhoneOtp = (phone_number: string, otp: string, options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/login-by-phone-otp", { phone_number, otp }, options);
};

export const loginByEmailOtp = (email: string, otp: string, options?: RequestOptions) => {
  return postJson<AuthResponse>("/auth/login-by-email-otp", { email, otp }, options);
};

export const verifyEmailOtp = (email: string, otp: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; success?: boolean }>("/auth/otp/verify-email", {
    email,
    otp,
    type,
  }, options);
};

export const verifyPhoneOtp = (phone_number: string, otp: string, type: string, options?: RequestOptions) => {
  return postJson<{ message: string; status: string; success?: boolean }>("/auth/otp/verify-phone", {
    phone_number,
    otp,
    type,
  }, options);
};

export const forgetPassword = (payload: ForgetPasswordPayload, options?: RequestOptions) => {
  return postJson<{ message: string; status: string }>("/auth/forget-password", {
    ...payload,
    academy_id: payload.academy_id ?? env.defaultAcademyId,
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
        publicUrl: string;
      };
    };
  }>(`/profiles/${profileId}`, data, options);
  return response.data;
};

export const updateStore = async (
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
  }>("/academies/current", data, options);
  return response.data;
};

export type LessonLiveSession = {
  id: number;
  lesson_id: number;
  meeting_url: string | null;
  playback_url?: string | null;
  starts_at: string;
  ends_at?: string | null;
  duration_minutes?: number | null;
  timezone: string;
  recurrence_rule?: string | null;
  recurrence_until?: string | null;
  provider_label?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export const getLesson = async (lessonId: string | number, options?: RequestOptions) => {
  const raw = await getJson<{
    status?: string;
    data?: Record<string, unknown> | null;
  }>(`/lessons/${lessonId}`, options);
  if (raw && typeof raw === 'object' && raw.status === 'ok' && raw.data) {
    return raw.data;
  }
  return null;
};

export const getLessonLiveSession = async (
  lessonId: string | number,
  options?: RequestOptions
): Promise<LessonLiveSession | null> => {
  const raw = await getJson<{
    status?: string;
    data?: LessonLiveSession | null;
    message?: string;
  }>(`/lessons/${lessonId}/live-session`, options);
  if (raw && typeof raw === 'object' && raw.status === 'ok' && raw.data) {
    return raw.data;
  }
  return null;
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

export interface CourseReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  created_at: string;
  Profile?: {
    id: string;
    display_name: string;
    Image_Profile_avatar_idToImage?: { publicUrl: string | null } | null;
  };
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  summary: { avg_rating: number; total_reviews: number; can_review: boolean };
}

export const getCourseReviews = async (
  courseId: number,
  options?: RequestOptions
) => {
  const response = await getJson<{
    message: string;
    status: string;
    data: CourseReviewsResponse;
  }>(`/courses/${courseId}/reviews`, options);
  return response.data;
};

export const createCourseReview = async (
  courseId: number,
  review: { rating: number; title?: string; content?: string },
  options?: RequestOptions
) => {
  const response = await postJson<{
    message: string;
    status: string;
    data: CourseReview;
  }>(`/courses/${courseId}/reviews`, review, options);
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


// =====================================================================
// Quiz, Assessment & Discussion (checklist 5.19)
// =====================================================================

export type QuizQuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_TEXT";
export type QuizAttemptStatus = "IN_PROGRESS" | "PENDING_REVIEW" | "GRADED";

export interface QuizOption {
  id: string;
  text: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  points: number;
  order: number;
  Option: QuizOption[];
}

export interface StudentQuiz {
  id: string;
  title: string;
  description?: string | null;
  passing_score: number;
  is_published: boolean;
  Question: QuizQuestion[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_boolean?: boolean | null;
  answer_text?: string | null;
  is_correct?: boolean | null;
  awarded_points: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  status: QuizAttemptStatus;
  score: number;
  max_score: number;
  passed?: boolean | null;
  feedback?: string | null;
  Answer?: QuizAnswer[];
}

export interface AnswerInput {
  question_id: string;
  selected_option_id?: string;
  answer_boolean?: boolean;
  answer_text?: string;
}

export interface DiscussionMessage {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  Author?: { id: string; display_name: string | null };
}

type Envelope<T> = { message: string; status: string; data: T };

export const getLessonQuiz = async (lessonId: string, options?: RequestOptions) =>
  (await getJson<Envelope<StudentQuiz>>(`/lessons/${lessonId}/quiz`, options)).data;

export const startQuizAttempt = async (quizId: string, options?: RequestOptions) =>
  (await postJson<Envelope<QuizAttempt>>(`/quizzes/${quizId}/attempt`, {}, options)).data;

export const saveQuizAnswers = async (attemptId: string, answers: AnswerInput[], options?: RequestOptions) =>
  (await patchJson<Envelope<{ attempt_id: string }>>(`/quiz-attempts/${attemptId}/answers`, { answers }, options)).data;

export const submitQuizAttempt = async (attemptId: string, options?: RequestOptions) =>
  (await postJson<Envelope<QuizAttempt>>(`/quiz-attempts/${attemptId}/submit`, {}, options)).data;

export const getQuizAttempt = async (attemptId: string, options?: RequestOptions) =>
  (await getJson<Envelope<QuizAttempt>>(`/quiz-attempts/${attemptId}`, options)).data;

export const getDiscussionThread = async (threadId: string, options?: RequestOptions) =>
  (await getJson<Envelope<{ thread: unknown; messages: DiscussionMessage[] }>>(`/discussions/threads/${threadId}`, options)).data;

export const postDiscussionMessage = async (
  parent: { attempt_id?: string; submission_id?: string },
  body: string,
  options?: RequestOptions,
) => (await postJson<Envelope<DiscussionMessage>>(`/discussions/messages`, { ...parent, body }, options)).data;

// ----- Support tickets -----

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_ON_USER" | "RESOLVED" | "CLOSED" | "REOPENED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type TicketCategory =
  | "BILLING" | "PAYMENT" | "COURSE_ACCESS" | "LIVE_CLASS" | "TECHNICAL" | "CONTENT" | "OTHER";

export interface TicketPerson {
  id: string;
  display_name: string;
}

export interface TicketResponsible extends TicketPerson {
  role: string;
}

export interface TicketListItem {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  created_at: string;
  last_activity_at: string;
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  _count: { Message: number };
}

export interface TicketAttachmentView {
  id: string;
  image_id: string;
  mime: string;
}

export interface TicketMessageView {
  id: string;
  kind: "USER_MESSAGE" | "INTERNAL_NOTE" | "SYSTEM_EVENT";
  body: string;
  author_id: string;
  author_role: string;
  created_at: string;
  system_event_type?: string | null;
  system_meta?: Record<string, string | null> | null;
  Author: TicketPerson | null;
  Attachment: TicketAttachmentView[];
}

export interface TicketCapabilities {
  canView: boolean;
  canReply: boolean;
  canManage: boolean;
  canReassign: boolean;
  canInternalNote: boolean;
  isAuthor: boolean;
  isPlatformStaff: boolean;
}

export interface TicketDetail {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  scope: "ACADEMY" | "PLATFORM";
  created_at: string;
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  Message: TicketMessageView[];
  CallRequest: Array<{ id: string; status: string; phone: string; outcome_note: string | null; called_at: string | null }>;
  Rating: { score: number; comment: string | null } | null;
  capabilities: TicketCapabilities;
}

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  priority?: TicketPriority;
  responsible_id: string;
  body: string;
  image_ids?: string[];
  request_call?: boolean;
  phone?: string;
  preferred_time?: string;
}

export const listSupportResponsibles = async (options?: RequestOptions) =>
  (await getJson<Envelope<TicketResponsible[]>>(`/support/responsibles`, options)).data;

export const listMySupportTickets = async (params?: { status?: TicketStatus }, options?: RequestOptions) => {
  const qs = params?.status ? `?status=${params.status}` : "";
  return (await getJson<Envelope<{ items: TicketListItem[]; total: number }>>(`/support/tickets/mine${qs}`, options)).data;
};

export const getSupportTicket = async (id: string, options?: RequestOptions) =>
  (await getJson<Envelope<TicketDetail>>(`/support/tickets/${id}`, options)).data;

export const createSupportTicket = async (payload: CreateTicketPayload, options?: RequestOptions) =>
  (await postJson<Envelope<TicketDetail>>(`/support/tickets`, { ...payload }, options)).data;

export const replySupportTicket = async (
  id: string,
  payload: { body: string; image_ids?: string[] },
  options?: RequestOptions,
) => (await postJson<Envelope<{ id: string }>>(`/support/tickets/${id}/reply`, { ...payload }, options)).data;

export const requestSupportCall = async (
  id: string,
  payload: { phone: string; preferred_time?: string },
  options?: RequestOptions,
) => (await postJson<Envelope<TicketDetail>>(`/support/tickets/${id}/request-call`, { ...payload }, options)).data;

export const rateSupportTicket = async (
  id: string,
  payload: { score: number; comment?: string },
  options?: RequestOptions,
) => (await postJson<Envelope<{ ticket_id: string; score: number }>>(`/support/tickets/${id}/rate`, { ...payload }, options)).data;

export const uploadSupportAttachment = async (file: File, options?: RequestOptions) => {
  const form = new FormData();
  form.append("file", file);
  // No Content-Type: the browser sets the multipart boundary itself.
  const headers = buildHeaders();
  const response = await fetch(`${getBaseUrl()}/support/attachments`, {
    method: "POST",
    credentials: "include",
    headers,
    body: form,
    signal: options?.signal,
  });
  return (await handleResponse<Envelope<{ id: string; mime: string; size: number }>>(response, undefined, true)).data;
};
