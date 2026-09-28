import type { LessonQuizSummary, SeasonSummary } from '@/lib/api/types';

/** A quiz or assignment that is not a lesson: it closes a season or the course. */
export type CourseWork =
  | { type: 'quiz'; parent: { kind: 'season' | 'course'; id: string }; title: string }
  | { type: 'assignment'; parent: { kind: 'season'; id: string }; title: string };

export function seasonWork(season: SeasonSummary): CourseWork[] {
  const parent = { kind: 'season' as const, id: String(season.id) };
  const work: CourseWork[] = [];
  if (season.Quiz?.is_published) work.push({ type: 'quiz', parent, title: season.Quiz.title });
  if (season.Assignment) work.push({ type: 'assignment', parent, title: season.Assignment.title });
  return work;
}

export function courseWork(courseId: string, quiz: LessonQuizSummary | null): CourseWork[] {
  if (!quiz?.is_published) return [];
  return [{ type: 'quiz', parent: { kind: 'course', id: courseId }, title: quiz.title }];
}

export const WORK_LABEL_KEY = {
  season: { quiz: 'learning.seasonQuiz', assignment: 'learning.seasonAssignment' },
  course: { quiz: 'learning.courseQuiz', assignment: 'learning.courseQuiz' },
} as const;
