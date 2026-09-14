import type { LessonSummary, SeasonSummary } from '@/lib/api/types';

export interface FlatLesson {
  lesson: LessonSummary;
  id: string;
  seasonTitle: string;
  /** 1-based position across the whole course, as shown to the student. */
  index: number;
}

/** Every published lesson in reading order, so numbering and prev/next agree. */
export function flattenLessons(seasons: SeasonSummary[]): FlatLesson[] {
  const flat: FlatLesson[] = [];
  for (const season of seasons) {
    for (const lesson of season.Lesson ?? []) {
      if (lesson.is_published === false) continue;
      flat.push({
        lesson,
        id: String(lesson.id),
        seasonTitle: season.title,
        index: flat.length + 1,
      });
    }
  }
  return flat;
}

export function neighboursOf(
  lessons: readonly FlatLesson[],
  currentId: string,
): { previous: FlatLesson | null; next: FlatLesson | null; current: FlatLesson | null } {
  const at = lessons.findIndex((item) => item.id === currentId);
  if (at < 0) return { previous: null, next: null, current: null };
  return {
    previous: lessons[at - 1] ?? null,
    next: lessons[at + 1] ?? null,
    current: lessons[at] ?? null,
  };
}

export function completionPercent(total: number, completed: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

export type LessonWatchProgress = {
  lesson_id: string;
  status?: string | null;
  covered_seconds?: number | null;
  media_duration?: number | null;
};

/** Unique watch/listen coverage + completed exams, as 0–100. */
export function watchPercent(
  lessons: readonly FlatLesson[],
  progressRows: readonly LessonWatchProgress[],
): number {
  if (lessons.length === 0) return 0;
  const byId = new Map(progressRows.map((row) => [row.lesson_id, row]));
  let total = 0;
  for (const item of lessons) {
    const row = byId.get(item.id);
    const type = (item.lesson.lesson_type ?? 'TEXT').toUpperCase();
    if (type === 'VIDEO' || type === 'AUDIO') {
      const duration =
        row?.media_duration ||
        item.lesson.duration ||
        item.lesson.Video?.duration ||
        item.lesson.Audio?.duration ||
        0;
      const covered = row?.covered_seconds ?? 0;
      if (duration > 0) {
        total += Math.min(1, covered / duration);
      } else {
        total += row?.status === 'COMPLETED' ? 1 : 0;
      }
    } else {
      total += row?.status === 'COMPLETED' ? 1 : 0;
    }
  }
  return Math.min(100, Math.round((total / lessons.length) * 100));
}
