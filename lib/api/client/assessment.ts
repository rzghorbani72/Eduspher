'use client';

import { apiFetch, buildHeaders, handleResponse, postJson } from './core';
import type { RequestOptions } from './core';
import { getJson, patchJson } from './http-helpers';
import type { QuizAttemptStatus, QuizGate, QuizQuestion, StudentQuiz } from './lessons-and-quizzes';

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
  attempt_number: number;
  status: QuizAttemptStatus;
  score: number;
  max_score: number;
  passed?: boolean | null;
  feedback?: string | null;
  Answer?: QuizAnswer[];
  /** The questions drawn for this attempt, answer keys removed. */
  Question?: QuizQuestion[];
  /** Set on the submit that just earned the course certificate. */
  certificate_number?: string | null;
}

export interface AnswerInput {
  question_id: string;
  selected_option_id?: string;
  answer_boolean?: boolean;
  answer_text?: string;
}

export interface DiscussionAttachment {
  id: string;
  title: string;
  publicUrl: string | null;
  mime_type: string | null;
  size: number | null;
}

export interface DiscussionMessage {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  Author?: { id: string; display_name: string | null };
  Document?: DiscussionAttachment | null;
  /** Teacher's grade (0-100) on a handed-in file. */
  score?: number | null;
}

export type Envelope<T> = { message: string; status: string; data: T };

export const getLessonQuiz = async (lessonId: string, options?: RequestOptions) =>
  (await getJson<Envelope<StudentQuiz>>(`/lessons/${lessonId}/quiz`, options)).data;

export const getSeasonQuiz = async (seasonId: string, options?: RequestOptions) =>
  (await getJson<Envelope<StudentQuiz>>(`/seasons/${seasonId}/quiz`, options)).data;

export const getCourseQuiz = async (courseId: string, options?: RequestOptions) =>
  (await getJson<Envelope<StudentQuiz>>(`/courses/${courseId}/quiz`, options)).data;

export const getSessionQuiz = async (sessionId: string, options?: RequestOptions) =>
  (await getJson<Envelope<StudentQuiz>>(`/tutoring-sessions/${sessionId}/quiz`, options)).data;

export const getQuizGates = async (courseId: string, options?: RequestOptions) =>
  (await getJson<Envelope<Record<string, QuizGate>>>(`/courses/${courseId}/quiz-gates`, options))
    .data;

export const startQuizAttempt = async (quizId: string, options?: RequestOptions) =>
  (await postJson<Envelope<QuizAttempt>>(`/quizzes/${quizId}/attempt`, {}, options)).data;

export const saveQuizAnswers = async (
  attemptId: string,
  answers: AnswerInput[],
  options?: RequestOptions,
) =>
  (
    await patchJson<Envelope<{ attempt_id: string }>>(
      `/quiz-attempts/${attemptId}/answers`,
      { answers },
      options,
    )
  ).data;

export const submitQuizAttempt = async (attemptId: string, options?: RequestOptions) =>
  (await postJson<Envelope<QuizAttempt>>(`/quiz-attempts/${attemptId}/submit`, {}, options)).data;

export const getQuizAttempt = async (attemptId: string, options?: RequestOptions) =>
  (await getJson<Envelope<QuizAttempt>>(`/quiz-attempts/${attemptId}`, options)).data;

export const getDiscussionThread = async (threadId: string, options?: RequestOptions) =>
  (
    await getJson<Envelope<{ thread: unknown; messages: DiscussionMessage[] }>>(
      `/discussions/threads/${threadId}`,
      options,
    )
  ).data;

/** Every parent a thread can hang from. Exactly one is sent. */
export type DiscussionParent = {
  attempt_id?: string;
  submission_id?: string;
  engagement_id?: string;
  tutoring_session_id?: string;
  tutoring_group_id?: string;
  lesson_id?: string;
  course_id?: string;
};

/**
 * The thread for a parent, whether or not it exists yet. A chat box has to
 * render before anyone has written in it, and threads are created lazily.
 */
export const findDiscussionThread = async (parent: DiscussionParent, options?: RequestOptions) => {
  const query = new URLSearchParams(
    Object.entries(parent).filter(([, value]) => Boolean(value)) as [string, string][],
  );
  return (
    await getJson<Envelope<{ thread: { id: string } | null; messages: DiscussionMessage[] }>>(
      `/discussions/thread?${query.toString()}`,
      options,
    )
  ).data;
};

export const postDiscussionMessage = async (
  parent: DiscussionParent,
  body: string,
  documentId?: string,
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<DiscussionMessage>>(
      `/discussions/messages`,
      { ...parent, body, ...(documentId ? { document_id: documentId } : {}) },
      options,
    )
  ).data;

/** A file for a chat message; the id is then sent with the message. */
const uploadToDiscussions = async (path: string, file: File, options?: RequestOptions) => {
  const form = new FormData();
  form.append('file', file);
  // No Content-Type: the browser sets the multipart boundary itself.
  const headers = await buildHeaders({}, { mutate: true });
  const response = await apiFetch(path, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: form,
    signal: options?.signal,
  });
  return (await handleResponse<Envelope<DiscussionAttachment>>(response, undefined, true)).data;
};

export const uploadDiscussionAttachment = (file: File, options?: RequestOptions) =>
  uploadToDiscussions('/discussions/attachments', file, options);

/** Teacher chat accepts .zip only; the server checks the bytes. */
export const uploadDiscussionZip = (file: File, options?: RequestOptions) =>
  uploadToDiscussions('/discussions/attachments/zip', file, options);

/**
 * Live ClassChat: open an SSE stream (with auth headers). Falls back silently
 * when the stream cannot start — DiscussionThread keeps polling.
 */
export const subscribeDiscussionEvents = (threadId: string, onEvent: () => void): (() => void) => {
  const controller = new AbortController();
  let closed = false;

  const run = async () => {
    try {
      const headers = await buildHeaders({ Accept: 'text/event-stream' });
      const response = await apiFetch(`/discussions/threads/${threadId}/events`, {
        method: 'GET',
        credentials: 'include',
        headers,
        signal: controller.signal,
      });
      if (!response.ok || !response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          const line = chunk.split('\n').find((entry) => entry.startsWith('data:'));
          if (!line) continue;
          try {
            const payload = JSON.parse(line.slice(5).trim()) as { type?: string };
            if (payload.type === 'message') onEvent();
          } catch {
            /* ignore malformed frames */
          }
        }
      }
    } catch {
      /* aborted or offline — poll covers it */
    }
  };

  void run();
  return () => {
    closed = true;
    controller.abort();
  };
};

// ----- Support tickets -----

export type TicketStatus =
  'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_USER' | 'RESOLVED' | 'CLOSED' | 'REOPENED';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type TicketCategory =
  'BILLING' | 'PAYMENT' | 'COURSE_ACCESS' | 'LIVE_CLASS' | 'TECHNICAL' | 'CONTENT' | 'OTHER';

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
  kind: 'USER_MESSAGE' | 'INTERNAL_NOTE' | 'SYSTEM_EVENT';
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
  scope: 'ACADEMY' | 'PLATFORM';
  created_at: string;
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  Message: TicketMessageView[];
  CallRequest: Array<{
    id: string;
    status: string;
    phone: string;
    outcome_note: string | null;
    called_at: string | null;
  }>;
  Rating: { score: number; comment: string | null } | null;
  capabilities: TicketCapabilities;
}
