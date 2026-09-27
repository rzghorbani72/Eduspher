import {
  Check,
  ClipboardList,
  FileText,
  Headphones,
  HelpCircle,
  LockKeyhole,
  Play,
  PlayCircle,
  Radio,
} from 'lucide-react';

import Link from '@/components/ui/link';
import { MetaDot } from '@/components/learning/meta-dot';
import type { LessonSummary, LessonType, SeasonSummary } from '@/lib/api/types';
import type { QuizGate } from '@/lib/api/client';
import { formatSeconds } from '@/components/courses/curriculum/format';
import { flattenLessons } from '@/lib/learning/lesson-list';
import { learnPath } from '@/lib/content-paths';
import { cn, buildAcademyPath, toPersianDigits } from '@/lib/utils';

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  AUDIO: Headphones,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
  LIVE: Radio,
};

const TYPE_KEY: Record<LessonType, string> = {
  VIDEO: 'learning.typeVideo',
  AUDIO: 'learning.typeAudio',
  TEXT: 'learning.typeText',
  QUIZ: 'learning.typeQuiz',
  ASSIGNMENT: 'learning.typeAssignment',
  LIVE: 'learning.typeLive',
};

const DAY = 86_400_000;

/** Days until a dated unlock, or null when the lesson is already open. */
function daysUntilUnlock(lesson: LessonSummary): number | null {
  if (!lesson.available_at) return null;
  const at = new Date(lesson.available_at).getTime();
  if (Number.isNaN(at) || at <= Date.now()) return null;
  return Math.max(1, Math.ceil((at - Date.now()) / DAY));
}

interface LearningCurriculumProps {
  courseSlug: string;
  seasons: SeasonSummary[];
  selectedLessonId: string;
  completedLessonIds: ReadonlySet<string>;
  /** Lessons locked behind a required quiz the student has not passed yet. */
  quizGates: Readonly<Record<string, QuizGate>>;
  storeSlug: string | null;
  lessonLabel: string;
  language: string;
  t: (key: string) => string;
}

export function LearningCurriculum({
  courseSlug,
  seasons,
  selectedLessonId,
  completedLessonIds,
  quizGates,
  storeSlug,
  lessonLabel,
  language,
  t,
}: LearningCurriculumProps) {
  // Same source of truth as prev/next, so the numbers a student sees and the
  // order they move through never disagree.
  const numbers = new Map(flattenLessons(seasons).map((item) => [item.id, item.index]));

  return (
    <nav aria-label={lessonLabel}>
      {seasons.map((season) => {
        const lessons = season.Lesson ?? [];
        const seconds = lessons.reduce((total, lesson) => total + (lesson.duration ?? 0), 0);
        return (
          <section key={String(season.id)}>
            <div className="border-theme bg-surface flex items-center justify-between gap-3 border-b px-[22px] py-3">
              <h3 className="text-xs font-extrabold">{season.title}</h3>
              {/* Separate spans, not one interpolated string: a "·" sitting
                  between Persian digits and Persian words is a neutral
                  character and gets reordered by the bidi algorithm. */}
              <span className="text-muted flex shrink-0 items-center text-[11px]">
                <span>{`${toPersianDigits(lessons.length, language)} ${t('courses.lesson')}`}</span>
                {seconds > 0 ? (
                  <>
                    <MetaDot />
                    <span>{formatSeconds(seconds, language, t)}</span>
                  </>
                ) : null}
              </span>
            </div>

            <ol>
              {lessons.map((lesson) => {
                const lessonId = String(lesson.id);
                const selected = lessonId === selectedLessonId;
                const completed = completedLessonIds.has(lessonId);
                const unlockDays = daysUntilUnlock(lesson);
                const gate = quizGates[lessonId];
                const locked =
                  lesson.is_published === false || unlockDays !== null || Boolean(gate);
                const type = lesson.lesson_type ?? 'TEXT';
                const Icon = TYPE_ICON[type] ?? FileText;
                const duration = formatSeconds(lesson.duration, language, t);

                const body = (
                  <>
                    <span
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold',
                        completed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : selected
                            ? 'bg-(--theme-primary) text-white'
                            : locked
                              ? 'bg-surface-alt text-muted/70'
                              : 'bg-surface-alt text-muted',
                      )}
                      aria-hidden="true"
                    >
                      {completed ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : selected ? (
                        <Play className="size-3" fill="currentColor" />
                      ) : locked ? (
                        <LockKeyhole className="size-3" />
                      ) : (
                        toPersianDigits(numbers.get(lessonId) ?? 0, language)
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span
                          className={cn(
                            'flex-1 text-[13px] leading-[1.65]',
                            selected
                              ? 'text-foreground font-extrabold'
                              : locked
                                ? 'text-muted/70 font-semibold'
                                : completed
                                  ? 'text-muted font-semibold'
                                  : 'text-foreground font-semibold',
                          )}
                        >
                          {lesson.title}
                        </span>
                        {lesson.is_free ? (
                          <span className="shrink-0 rounded-full bg-(--theme-primary)/15 px-2 py-0.5 text-[10px] font-extrabold text-(--theme-primary-ink)">
                            {t('courses.free')}
                          </span>
                        ) : null}
                      </span>

                      <span className="text-muted mt-1 flex items-center gap-1.5 text-[11px]">
                        <Icon className="size-3 shrink-0" aria-hidden="true" />
                        <span>{t(TYPE_KEY[type])}</span>
                        {duration ? (
                          <>
                            <MetaDot />
                            <span>{duration}</span>
                          </>
                        ) : null}
                      </span>

                      {gate ? (
                        <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-(--theme-primary)/15 px-2 py-1 text-[11px] font-semibold text-(--theme-primary-ink)">
                          <LockKeyhole className="size-3" aria-hidden="true" />
                          {t('learning.passQuizFirst').replace('{quiz}', gate.title)}
                        </span>
                      ) : unlockDays !== null ? (
                        <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-(--theme-primary)/15 px-2 py-1 text-[11px] font-semibold text-(--theme-primary-ink)">
                          <LockKeyhole className="size-3" aria-hidden="true" />
                          {t('learning.unlocksInDays').replace(
                            '{days}',
                            toPersianDigits(unlockDays, language),
                          )}
                        </span>
                      ) : null}
                    </span>
                  </>
                );

                const rowClass = cn(
                  'flex gap-3 border-b border-theme py-[13px] pe-[22px] transition-colors',
                  selected
                    ? 'border-s-[3px] border-s-(--theme-primary) bg-(--theme-primary)/10 ps-[19px]'
                    : cn('ps-[22px]', locked ? '' : 'hover:bg-surface'),
                );

                return (
                  <li key={lessonId}>
                    {locked ? (
                      <span className={cn(rowClass, 'cursor-not-allowed')}>{body}</span>
                    ) : (
                      <Link
                        href={buildAcademyPath(
                          storeSlug,
                          learnPath(courseSlug, lesson.slug ?? lesson.id),
                        )}
                        aria-current={selected ? 'page' : undefined}
                        className={rowClass}
                      >
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </nav>
  );
}
