'use client';

import { postJson } from './core';
import type { RequestOptions } from './core';
import { deleteJson, getJson, patchJson, putJson } from './http-helpers';

export const updateStore = async (
  data: { name?: string; description?: string },
  options?: RequestOptions,
) => {
  const response = await patchJson<{
    message: string;
    status: string;
    data: {
      id: string;
      name: string;
      description?: string;
    };
  }>('/academies/current', data, options);
  return response.data;
};

export type LessonLiveSession = {
  id: string;
  lesson_id: string;
  /** Null for students — they join through `join_url` instead. */
  meeting_url: string | null;
  /** Our own join route: re-checks access and records attendance, then forwards. */
  join_url?: string | null;
  /** Whether the room behind join_url can be shown in an iframe. */
  embeddable?: boolean;
  /** After this the join token expires and the room is left. */
  link_closes_at?: string | null;
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
  options?: RequestOptions,
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
  id: string;
  course_id: string;
  profile_id: string;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_by: string | null;
  answered_at: string | null;
  created_at: string;
  mine?: boolean;
  profile?: {
    id: string;
    display_name: string;
  } | null;
  answerer?: {
    id: string;
    display_name: string;
  } | null;
}

export interface CourseQnAList {
  items: CourseQnA[];
  can_moderate: boolean;
}

export const getCourseQnAs = async (courseId: string, options?: RequestOptions) => {
  const response = await getJson<{
    message: string;
    status: string;
    data: CourseQnAList | CourseQnA[];
  }>(`/courses/${courseId}/qna`, options);
  const payload = response.data;
  if (Array.isArray(payload)) {
    return { items: payload, can_moderate: false };
  }
  return payload ?? { items: [], can_moderate: false };
};

export const createCourseQnA = async (
  courseId: string,
  question: string,
  options?: RequestOptions,
) => {
  const response = await postJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna`, { question }, options);
  return response.data;
};

export const approveCourseQnA = async (
  courseId: string,
  qnaId: string,
  isApproved: boolean,
  options?: RequestOptions,
) => {
  const response = await putJson<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna/${qnaId}/approve`, { is_approved: isApproved }, options);
  return response.data;
};

export const answerCourseQnA = async (
  courseId: string,
  qnaId: string,
  answer: string,
  options?: RequestOptions,
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

export type RatingCounts = [number, number, number, number, number];

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  summary: {
    avg_rating: number;
    total_reviews: number;
    counts: RatingCounts;
    can_review: boolean;
    is_enrolled: boolean;
  };
}

export const getCourseReviews = async (courseId: string, options?: RequestOptions) => {
  const response = await getJson<{
    message: string;
    status: string;
    data: CourseReviewsResponse;
  }>(`/courses/${courseId}/reviews`, options);
  return response.data;
};

export const createCourseReview = async (
  courseId: string,
  review: { rating: number; title?: string; content?: string },
  options?: RequestOptions,
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
  id: string;
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
  }>('/auth/sessions', options);
  return response.sessions ?? [];
};

/**
 * Revoke a specific session by ID
 */
export const revokeSession = async (sessionId: string, options?: RequestOptions) => {
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
  }>('/auth/logout-all', {}, options);
};

// =====================================================================
// Quiz, Assessment & Discussion (checklist 5.19)
// =====================================================================

export type QuizQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT';

export type QuizAttemptStatus = 'IN_PROGRESS' | 'PENDING_REVIEW' | 'GRADED';

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
  Option: QuizOption[];
}

export interface QuizAttemptRow {
  id: string;
  attempt_number: number;
  status: QuizAttemptStatus;
  score: number;
  max_score: number;
  passed?: boolean | null;
  submitted_at?: string | null;
}

/** The rules and the student's own history; the question bank never comes down. */
export interface StudentQuiz {
  id: string;
  title: string;
  description?: string | null;
  lesson_id: string | null;
  tutoring_session_id: string | null;
  pass_percent: number;
  is_required: boolean;
  is_final: boolean;
  max_attempts: number | null;
  question_count: number;
  attempts: QuizAttemptRow[];
  passed: boolean;
  open_attempt_id: string | null;
  /** null = unlimited. */
  attempts_left: number | null;
  can_start: boolean;
}

/** A lesson the student cannot open yet, and the quiz in the way. */
export interface QuizGate {
  quiz_id: string;
  /** Exactly one is set: the quiz sits on a lesson or closes a season. */
  lesson_id: string | null;
  season_id: string | null;
  title: string;
}
