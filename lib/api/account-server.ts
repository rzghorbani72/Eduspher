import "server-only";

import { serverFetch, serverFetchRaw } from "@/lib/api/server";
import type {
  AccountProfile,
  MyTutoringGroupRow,
  TutoringGroupRoom,
  AcademyPlanPublic,
  AssignmentSummary,
  CourseAccessRow,
  NotificationItem,
  PageMeta,
  PaymentReceipt,
  PaymentSummary,
  QuizAttemptSummary,
  StudentCertificate,
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
    const result = await serverFetch<CourseAccessRow[]>(
      "/enrollments/my-access",
    );
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

export const getMyCertificates = () =>
  safe<StudentCertificate[]>(async () => {
    const result =
      await serverFetch<StudentCertificate[]>("/certificates/mine");
    return result.data ?? [];
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
    Course?: { id: string; title: string; slug?: string } | null;
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

export type TutoringSessionRow = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  meeting_url: string | null;
};

export type TutoringEngagementRow = {
  id: string;
  course_id: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  Course?: { id: string; title: string; slug?: string } | null;
  Tutor?: { id: string; display_name: string } | null;
  Sessions?: TutoringSessionRow[];
};

export const getTutoringEngagements = () =>
  safe<TutoringEngagementRow[]>(async () => {
    const result = await serverFetch<TutoringEngagementRow[]>(
      "/tutoring/engagements",
    );
    return result.data ?? [];
  }, []);

/** Group classes the signed-in student holds a seat in. */
export const getMyTutoringGroups = () =>
  safe<MyTutoringGroupRow[]>(async () => {
    const result = await serverFetch<MyTutoringGroupRow[]>(
      "/tutoring/groups/mine",
    );
    return result.data ?? [];
  }, []);

/** The class page. Returns null when the caller is not in this class. */
export const getTutoringGroupRoom = (groupId: string) =>
  safe<TutoringGroupRoom | null>(async () => {
    const result = await serverFetch<TutoringGroupRoom>(
      `/tutoring/groups/${groupId}/room`,
    );
    return result.data ?? null;
  }, null);

/** The 1:1 classroom. Same shape as a group room; null when not the student or tutor. */
export const getTutoringEngagementRoom = (engagementId: string) =>
  safe<TutoringGroupRoom | null>(async () => {
    const result = await serverFetch<TutoringGroupRoom>(
      `/tutoring/engagements/${engagementId}/room`,
    );
    return result.data ?? null;
  }, null);

/**
 * The live classroom this student holds for a course: their group seat if
 * they have one, else their 1:1 engagement. Null when they hold neither.
 */
export const getMyLiveRoomForCourse = async (
  courseId: string,
): Promise<TutoringGroupRoom | null> => {
  const [groups, engagements] = await Promise.all([
    getMyTutoringGroups(),
    getTutoringEngagements(),
  ]);
  const group = groups.find((row) => row.group.course_id === courseId)?.group;
  if (group) return getTutoringGroupRoom(group.id);
  const solo = engagements.find(
    (row) =>
      row.course_id === courseId &&
      (row.status === "ACTIVE" || row.status === "PENDING"),
  );
  return solo ? getTutoringEngagementRoom(solo.id) : null;
};

export const getPayments = (params?: { page?: number; limit?: number }) =>
  safe<{ payments: PaymentSummary[]; pagination: PageMeta | null }>(
    async () => {
      const result = await serverFetch<{
        payments: PaymentSummary[];
        pagination: PageMeta;
      }>("/payments", { query: { limit: 50, ...params } });
      return {
        payments: result.data?.payments ?? [],
        pagination: result.data?.pagination ?? null,
      };
    },
    { payments: [], pagination: null },
  );

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
    const result = await serverFetch<AcademyPlanPublic[]>(
      "/academy-plans/public",
      {
        includeAuth: false,
        query: { kind },
      },
    );
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
  safe<{ notifications: NotificationItem[]; pagination: PageMeta | null }>(
    async () => {
      const result = await serverFetch<{
        notifications: NotificationItem[];
        pagination: PageMeta;
      }>("/notifications", { query: { limit: 30, ...params } });
      return {
        notifications: result.data?.notifications ?? [],
        pagination: result.data?.pagination ?? null,
      };
    },
    { notifications: [], pagination: null },
  );
