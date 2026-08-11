import type {
  CourseSummary,
  LessonSummary,
  LessonType,
  SeasonSummary,
} from "@/lib/api/types";

/**
 * Turns the raw course payload into the rows the curriculum UI renders.
 * Pure and time-free: anything that depends on "now" (is this live session
 * running?) is derived in the component, so the server render never disagrees
 * with the browser.
 */

export type LiveState = "upcoming" | "running" | "ended";

export interface LiveView {
  startsAt: string;
  endsAt: string | null;
  durationMinutes: number | null;
  timezone: string;
  isRecurring: boolean;
  recurrenceUntil: string | null;
  providerLabel: string | null;
}

export interface UnlockRule {
  kind: "date" | "drip";
  /** ISO date for `date`, day count for `drip`. */
  value: string | number;
}

export interface CurriculumLessonView {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  /** Free lessons are watchable without buying anything. */
  isPreview: boolean;
  durationMinutes: number | null;
  unlock: UnlockRule | null;
  downloadable: boolean;
  live: LiveView | null;
  quiz: { questionCount: number; passingScore: number } | null;
  assignment: {
    dueDate: string | null;
    maxScore: number;
    isRequired: boolean;
  } | null;
}

export interface CurriculumSeasonView {
  id: string;
  title: string;
  description: string | null;
  lessons: CurriculumLessonView[];
  totalMinutes: number;
}

export interface CourseContentStats {
  seasonCount: number;
  lessonCount: number;
  totalMinutes: number;
  videoCount: number;
  liveCount: number;
  quizCount: number;
  assignmentCount: number;
  previewCount: number;
  downloadableCount: number;
  hasDripContent: boolean;
}

const LESSON_TYPE_FALLBACK: LessonType = "VIDEO";

const resolveType = (lesson: LessonSummary): LessonType => {
  if (lesson.lesson_type) return lesson.lesson_type;
  if (lesson.LiveSession) return "LIVE";
  if (lesson.Quiz) return "QUIZ";
  if (lesson.Assignment) return "ASSIGNMENT";
  if (lesson.Audio) return "AUDIO";
  if (lesson.Video) return "VIDEO";
  return LESSON_TYPE_FALLBACK;
};

const resolveUnlock = (lesson: LessonSummary): UnlockRule | null => {
  if (lesson.available_at) return { kind: "date", value: lesson.available_at };
  if (lesson.drip_days_after_enrollment && lesson.drip_days_after_enrollment > 0) {
    return { kind: "drip", value: lesson.drip_days_after_enrollment };
  }
  return null;
};

const resolveDownloadable = (lesson: LessonSummary): boolean =>
  Boolean(
    lesson.allow_download_free ||
      lesson.allow_download_enrollment ||
      lesson.allow_download_subscription ||
      lesson.allow_download_tutoring,
  );

const toLessonView = (lesson: LessonSummary): CurriculumLessonView => ({
  id: lesson.id,
  title: lesson.title,
  description: lesson.description ?? null,
  type: resolveType(lesson),
  isPreview: Boolean(lesson.is_free),
  durationMinutes: lesson.duration ?? null,
  unlock: resolveUnlock(lesson),
  downloadable: resolveDownloadable(lesson),
  live: lesson.LiveSession
    ? {
        startsAt: lesson.LiveSession.starts_at,
        endsAt: lesson.LiveSession.ends_at ?? null,
        durationMinutes: lesson.LiveSession.duration_minutes ?? null,
        timezone: lesson.LiveSession.timezone,
        isRecurring: Boolean(lesson.LiveSession.recurrence_rule),
        recurrenceUntil: lesson.LiveSession.recurrence_until ?? null,
        providerLabel: lesson.LiveSession.provider_label ?? null,
      }
    : null,
  // A draft quiz exists in the payload but is not part of what is being sold.
  quiz: lesson.Quiz?.is_published
    ? {
        questionCount: lesson.Quiz._count?.Question ?? 0,
        passingScore: lesson.Quiz.passing_score,
      }
    : null,
  assignment: lesson.Assignment
    ? {
        dueDate: lesson.Assignment.due_date ?? null,
        maxScore: lesson.Assignment.max_score,
        isRequired: lesson.Assignment.is_required,
      }
    : null,
});

const toSeasonView = (season: SeasonSummary): CurriculumSeasonView => {
  const lessons = (season.Lesson ?? []).map(toLessonView);
  return {
    id: season.id,
    title: season.title,
    description: season.description ?? null,
    lessons,
    totalMinutes: lessons.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0),
  };
};

export const buildCurriculum = (course: CourseSummary): CurriculumSeasonView[] =>
  (course.Season ?? []).map(toSeasonView);

export const buildContentStats = (
  seasons: CurriculumSeasonView[],
  fallbackLessonCount?: number | null,
  fallbackMinutes?: number | null,
): CourseContentStats => {
  const lessons = seasons.flatMap((s) => s.lessons);
  const countOf = (type: LessonType) =>
    lessons.filter((l) => l.type === type).length;
  const totalMinutes = seasons.reduce((sum, s) => sum + s.totalMinutes, 0);

  return {
    seasonCount: seasons.length,
    lessonCount: lessons.length || (fallbackLessonCount ?? 0),
    totalMinutes: totalMinutes || (fallbackMinutes ?? 0),
    videoCount: countOf("VIDEO") + countOf("AUDIO"),
    liveCount: lessons.filter((l) => l.live !== null || l.type === "LIVE").length,
    quizCount: lessons.filter((l) => l.quiz !== null || l.type === "QUIZ").length,
    assignmentCount: lessons.filter(
      (l) => l.assignment !== null || l.type === "ASSIGNMENT",
    ).length,
    previewCount: lessons.filter((l) => l.isPreview).length,
    downloadableCount: lessons.filter((l) => l.downloadable).length,
    hasDripContent: lessons.some((l) => l.unlock !== null),
  };
};

/** Panel authors these as one item per line; blank lines are noise. */
export const parseAuthoredList = (value?: string | null): string[] =>
  (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0);

export const liveStateAt = (live: LiveView, now: number): LiveState => {
  const start = new Date(live.startsAt).getTime();
  const end = live.endsAt
    ? new Date(live.endsAt).getTime()
    : start + (live.durationMinutes ?? 60) * 60_000;
  if (now < start) return "upcoming";
  if (now <= end) return "running";
  // A repeating session is only really over once the series has run out.
  if (live.isRecurring) {
    const until = live.recurrenceUntil
      ? new Date(live.recurrenceUntil).getTime()
      : Number.POSITIVE_INFINITY;
    return now < until ? "upcoming" : "ended";
  }
  return "ended";
};
