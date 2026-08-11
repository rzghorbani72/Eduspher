import "server-only";

import { serverFetch, serverFetchRaw } from "@/lib/api/server";
import type {
  AccountProfile,
  AcademyPlanPublic,
  AssignmentSummary,
  CourseAccessRow,
  NotificationItem,
  PageMeta,
  PaymentReceipt,
  PaymentSummary,
  QuizAttemptSummary,
  SubmissionSummary,
} from "@/lib/api/account-types";

/**
 * Every fetcher here degrades to null/[] instead of throwing, matching the
 * convention in `server.ts`: a student page renders an empty state rather than
 * a crash when one section of the API is unavailable.
 */
const safe = async <T>(run: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await run();
  } catch {
    return fallback;
  }
};

export const getProfile = (profileId: string) =>
  safe<AccountProfile | null>(async () => {
    const result = await serverFetch<AccountProfile>(`/profiles/${profileId}`);
    return result.data ?? null;
  }, null);

export const getCourseAccess = () =>
  safe<CourseAccessRow[]>(async () => {
    const result = await serverFetch<CourseAccessRow[]>("/enrollments/my-access");
    return result.data ?? [];
  }, []);

export const getAssignments = () =>
  safe<AssignmentSummary[]>(async () => {
    const result = await serverFetch<{ assignments: AssignmentSummary[] }>(
      "/assignments",
    );
    return result.data?.assignments ?? [];
  }, []);

export const getAssignment = (assignmentId: string) =>
  safe<AssignmentSummary | null>(async () => {
    const result = await serverFetch<AssignmentSummary>(
      `/assignments/${assignmentId}`,
    );
    return result.data ?? null;
  }, null);

export const getSubmissions = () =>
  safe<SubmissionSummary[]>(async () => {
    const result = await serverFetch<{ submissions: SubmissionSummary[] }>(
      "/assignments/submissions",
    );
    return result.data?.submissions ?? [];
  }, []);

export const getQuizAttempt = (attemptId: string) =>
  safe<QuizAttemptSummary | null>(async () => {
    const result = await serverFetch<QuizAttemptSummary>(
      `/quiz-attempts/${attemptId}`,
    );
    return result.data ?? null;
  }, null);

export type LearningSummary = {
  enrollments: Array<{
    id: string;
    course_id: string;
    progress_percent: number;
    status: string;
    last_accessed: string | null;
    video_heartbeats: number;
    Course?: { id: string; title: string } | null;
  }>;
};

export const getLearningSummary = () =>
  safe<LearningSummary | null>(async () => {
    const result = await serverFetch<LearningSummary>(
      "/learning-record/summary",
    );
    return result.data ?? null;
  }, null);

export type TimelineActivity = {
  id: string;
  activity_type: string;
  created_at: string;
  payload?: Record<string, string | number | boolean | null> | null;
};

export const getLearningTimeline = (limit = 30) =>
  safe<TimelineActivity[]>(async () => {
    const result = await serverFetch<{ activities: TimelineActivity[] }>(
      "/learning-record/timeline",
      { query: { limit, page: 1 } },
    );
    return result.data?.activities ?? [];
  }, []);

export type TutoringEngagementRow = {
  id: string;
  course_id: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  Course?: { id: string; title: string } | null;
  Tutor?: { id: string; display_name: string } | null;
};

export const getTutoringEngagements = () =>
  safe<TutoringEngagementRow[]>(async () => {
    const result = await serverFetch<TutoringEngagementRow[]>("/tutoring/engagements");
    return result.data ?? [];
  }, []);

export const getPayments = (params?: { page?: number; limit?: number }) =>
  safe<{ payments: PaymentSummary[]; pagination: PageMeta | null }>(async () => {
    const result = await serverFetch<{
      payments: PaymentSummary[];
      pagination: PageMeta;
    }>("/payments", { query: { limit: 50, ...params } });
    return {
      payments: result.data?.payments ?? [],
      pagination: result.data?.pagination ?? null,
    };
  }, { payments: [], pagination: null });

export const getPayment = (paymentId: string) =>
  safe<PaymentSummary | null>(async () => {
    const result = await serverFetch<PaymentSummary>(`/payments/${paymentId}`);
    return result.data ?? null;
  }, null);

// The receipt endpoint answers with the receipt itself, not an envelope.
export const getPaymentReceipt = (paymentId: string) =>
  safe<PaymentReceipt | null>(
    () => serverFetchRaw<PaymentReceipt>(`/payments/${paymentId}/receipt`),
    null,
  );

export const getAcademyPlansPublicByKind = (kind: "SUBSCRIPTION" | "PACKAGE") =>
  safe<AcademyPlanPublic[]>(async () => {
    const result = await serverFetch<AcademyPlanPublic[]>("/academy-plans/public", {
      includeAuth: false,
      query: { kind },
    });
    return result.data ?? [];
  }, []);

export type StudentSubscriptionRow = {
  id: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  Plan: {
    id: string;
    name: string;
    kind: string;
    price: number;
    currency: string;
    duration_days: number | null;
  };
};

export const getMySubscriptions = () =>
  safe<StudentSubscriptionRow[]>(async () => {
    const result = await serverFetch<StudentSubscriptionRow[]>(
      "/academy-plans/my-subscriptions",
    );
    return result.data ?? [];
  }, []);

export const getNotifications = (params?: { page?: number; limit?: number }) =>
  safe<{ notifications: NotificationItem[]; pagination: PageMeta | null }>(async () => {
    const result = await serverFetch<{
      notifications: NotificationItem[];
      pagination: PageMeta;
    }>("/notifications", { query: { limit: 30, ...params } });
    return {
      notifications: result.data?.notifications ?? [],
      pagination: result.data?.pagination ?? null,
    };
  }, { notifications: [], pagination: null });
