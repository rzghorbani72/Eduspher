'use client';

import { getJson, patchJson, postJson, type RequestOptions } from '@/lib/api/client';
import type { LessonSummary, Pagination } from '@/lib/api/types';

type Envelope<T> = {
  message: string;
  status: string;
  data: T;
};

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LearningProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  status: ProgressStatus;
  watch_time: number;
  last_position: number;
  covered_seconds?: number;
  media_duration?: number;
  completed_at?: string | null;
  updated_at: string;
  Lesson?: {
    id: string;
    title: string;
    order: number;
    duration?: number | null;
  };
  Enrollment?: {
    id: string;
    Course?: { id: string; title: string };
  };
}

export interface LessonDetail extends Omit<LessonSummary, 'id'> {
  id: string;
  content?: string | null;
  is_published?: boolean;
  allow_download_free?: boolean;
  allow_download_enrollment?: boolean;
  allow_download_subscription?: boolean;
  allow_download_tutoring?: boolean;
  can_download?: boolean;
  // Present only when can_download is true — the server omits them otherwise.
  video_download_url?: string | null;
  audio_download_url?: string | null;
}

export interface Assignment {
  id: string;
  /** Exactly one parent is set: a lesson, a whole class, or one meeting. */
  lesson_id: string | null;
  tutoring_group_id?: string | null;
  tutoring_session_id?: string | null;
  title: string;
  description?: string | null;
  due_date?: string | null;
  max_score: number;
  is_required: boolean;
  Lesson?: {
    id: string;
    title: string;
    lesson_type?: string | null;
    Season?: { id: string; title: string; course_id: string };
  };
}

export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'REJECTED';

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  enrollment_id: string;
  profile_id: string;
  content?: string | null;
  file_url?: string | null;
  image_ids?: string[];
  status: SubmissionStatus;
  /** Recorded, never blocking — a late hand-in is still accepted. */
  is_late?: boolean;
  score?: number | null;
  feedback?: string | null;
  submitted_at?: string | null;
  graded_at?: string | null;
  Assignment?: {
    id: string;
    title: string;
    max_score: number;
    Lesson?: { id: string } | null;
  };
  GradedBy?: { id: string; display_name: string } | null;
}

export const getLearningLesson = async (lessonId: string, options?: RequestOptions) => {
  const response = await getJson<Envelope<LessonDetail>>(`/lessons/${lessonId}`, options);
  return response.data;
};

export const getProgress = async (
  params: {
    enrollmentId?: string;
    courseId?: string;
    lessonId?: string;
    limit?: number;
  },
  options?: RequestOptions,
) => {
  const query = new URLSearchParams();
  if (params.courseId) query.set('course_id', params.courseId);
  if (params.enrollmentId) query.set('enrollment_id', params.enrollmentId);
  if (params.courseId) query.set('course_id', params.courseId);
  if (params.lessonId) query.set('lesson_id', params.lessonId);
  query.set('limit', String(params.limit ?? 100));
  const response = await getJson<
    Envelope<{ progress: LearningProgress[]; pagination: Pagination }>
  >(`/progress?${query.toString()}`, options);
  return response.data;
};

export const saveProgress = async (payload: {
  enrollmentId: string;
  lessonId: string;
  status: ProgressStatus;
  watchTime: number;
}) => {
  const response = await postJson<Envelope<{ progress: LearningProgress }>>('/progress', {
    enrollment_id: payload.enrollmentId,
    lesson_id: payload.lessonId,
    status: payload.status,
    watch_time: Math.max(0, Math.floor(payload.watchTime)),
  });
  return response.data.progress;
};

export const updateProgress = async (
  progressId: string,
  payload: { status?: ProgressStatus; watchTime?: number },
) => {
  const response = await patchJson<Envelope<{ progress: LearningProgress }>>(
    `/progress/${progressId}`,
    {
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.watchTime !== undefined
        ? { watch_time: Math.max(0, Math.floor(payload.watchTime)) }
        : {}),
    },
  );
  return response.data.progress;
};

export const listAssignments = async (
  params: {
    lessonId?: string;
    courseId?: string;
    tutoringGroupId?: string;
    tutoringSessionId?: string;
    limit?: number;
  },
  options?: RequestOptions,
) => {
  const query = new URLSearchParams();
  if (params.lessonId) query.set('lesson_id', params.lessonId);
  if (params.courseId) query.set('course_id', params.courseId);
  if (params.tutoringGroupId) query.set('tutoring_group_id', params.tutoringGroupId);
  if (params.tutoringSessionId) query.set('tutoring_session_id', params.tutoringSessionId);
  query.set('limit', String(params.limit ?? 100));
  const response = await getJson<Envelope<{ assignments: Assignment[]; pagination: Pagination }>>(
    `/assignments?${query.toString()}`,
    options,
  );
  return response.data;
};

export const listSubmissions = async (
  params: {
    assignmentId?: string;
    courseId?: string;
    enrollmentId?: string;
    status?: SubmissionStatus;
    limit?: number;
  },
  options?: RequestOptions,
) => {
  const query = new URLSearchParams();
  if (params.assignmentId) query.set('assignment_id', params.assignmentId);
  if (params.courseId) query.set('course_id', params.courseId);
  if (params.enrollmentId) query.set('enrollment_id', params.enrollmentId);
  if (params.status) query.set('status', params.status);
  query.set('limit', String(params.limit ?? 100));
  const response = await getJson<
    Envelope<{ submissions: AssignmentSubmission[]; pagination: Pagination }>
  >(`/assignments/submissions?${query.toString()}`, options);
  return response.data;
};

/**
 * The enrollment is no longer sent: the server resolves it from the
 * assignment's own course, so a client can never file work against somebody
 * else's enrollment.
 */
export const submitAssignment = async (payload: {
  assignmentId: string;
  content?: string;
  imageIds?: string[];
}) => {
  const response = await postJson<Envelope<AssignmentSubmission>>('/assignments/submit', {
    assignment_id: payload.assignmentId,
    ...(payload.content ? { content: payload.content } : {}),
    ...(payload.imageIds?.length ? { image_ids: payload.imageIds } : {}),
  });
  return response.data;
};

export type LearningActivityType =
  | 'VIDEO_HEARTBEAT'
  | 'LESSON_COMPLETED'
  | 'QUIZ_SUBMITTED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'LIVE_ATTENDED'
  | 'TUTORING_SESSION'
  | 'ENROLLMENT_ACTIVATED'
  | string;

export interface LearningActivity {
  id: string;
  activity_type: LearningActivityType;
  payload?: Record<string, string | number | boolean | null> | null;
  created_at: string;
  enrollment_id?: string | null;
  course_id?: string | null;
  lesson_id?: string | null;
  engagement_id?: string | null;
}

export interface LearningSummaryEnrollment {
  id: string;
  course_id: string;
  progress_percent: number;
  status: string;
  last_accessed: string | null;
  video_heartbeats: number;
  Course?: { id: string; title: string } | null;
}

export type TutoringEngagementStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface TutoringEngagement {
  id: string;
  course_id: string;
  student_profile_id: string;
  tutor_profile_id: string;
  enrollment_id?: string | null;
  status: TutoringEngagementStatus;
  starts_at: string;
  ends_at?: string | null;
  activated_at?: string | null;
  Course?: { id: string; title: string } | null;
  Tutor?: { id: string; display_name: string } | null;
  Student?: { id: string; display_name: string } | null;
}

export const recordVideoHeartbeat = async (payload: {
  lessonId: string;
  enrollmentId: string;
  lastPosition: number;
  activeSeconds: number;
  segmentStart?: number;
  segmentEnd?: number;
  duration?: number;
}) => {
  const response = await postJson<
    Envelope<{
      id: string;
      covered_seconds?: number;
      media_duration?: number;
      progress_percent?: number;
    }>
  >('/learning-record/video-heartbeat', {
    lesson_id: payload.lessonId,
    enrollment_id: payload.enrollmentId,
    last_position: Math.max(0, Math.floor(payload.lastPosition)),
    active_seconds: Math.min(120, Math.max(0, Math.floor(payload.activeSeconds))),
    ...(payload.segmentStart !== undefined
      ? { segment_start: Math.max(0, Math.floor(payload.segmentStart)) }
      : {}),
    ...(payload.segmentEnd !== undefined
      ? { segment_end: Math.max(0, Math.floor(payload.segmentEnd)) }
      : {}),
    ...(payload.duration !== undefined && payload.duration > 0
      ? { duration: Math.max(1, Math.floor(payload.duration)) }
      : {}),
  });
  return response.data;
};

export const getLearningSummary = async (params?: { courseId?: string }) => {
  const query = new URLSearchParams();
  if (params?.courseId) query.set('course_id', params.courseId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await getJson<Envelope<{ enrollments: LearningSummaryEnrollment[] }>>(
    `/learning-record/summary${suffix}`,
  );
  return response.data;
};

export const getLearningTimeline = async (params?: {
  enrollmentId?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.enrollmentId) query.set('enrollment_id', params.enrollmentId);
  if (params?.courseId) query.set('course_id', params.courseId);
  query.set('page', String(params?.page ?? 1));
  query.set('limit', String(params?.limit ?? 20));
  const response = await getJson<
    Envelope<{ activities: LearningActivity[]; pagination: Pagination }>
  >(`/learning-record/timeline?${query.toString()}`);
  return response.data;
};

export const listTutoringEngagements = async (params?: { courseId?: string }) => {
  const query = new URLSearchParams();
  if (params?.courseId) query.set('course_id', params.courseId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await getJson<Envelope<TutoringEngagement[]>>(`/tutoring/engagements${suffix}`);
  return response.data ?? [];
};
