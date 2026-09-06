import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Headphones,
  HelpCircle,
  LockKeyhole,
  PlayCircle,
  Radio,
} from "lucide-react";

import Link from "@/components/ui/link";
import type { LessonType, SeasonSummary } from "@/lib/api/types";
import { formatSeconds } from "@/components/courses/curriculum/format";
import { flattenLessons } from "@/lib/learning/lesson-list";
import { cn, buildAcademyPath, toPersianDigits } from "@/lib/utils";

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  AUDIO: Headphones,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
  LIVE: Radio,
};

interface LearningCurriculumProps {
  courseId: string;
  seasons: SeasonSummary[];
  selectedLessonId: string;
  completedLessonIds: ReadonlySet<string>;
  storeSlug: string | null;
  lessonLabel: string;
  language: string;
  t: (key: string) => string;
}

export function LearningCurriculum({
  courseId,
  seasons,
  selectedLessonId,
  completedLessonIds,
  storeSlug,
  lessonLabel,
  language,
  t,
}: LearningCurriculumProps) {
  // Same source of truth as prev/next, so the numbers a student sees and the
  // order they move through never disagree.
  const numbers = new Map(
    flattenLessons(seasons).map((item) => [item.id, item.index]),
  );

  return (
    <nav aria-label={lessonLabel} className="space-y-4">
      {seasons.map((season) => (
        <section key={String(season.id)}>
          <h3 className="px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {season.title}
          </h3>
          <ol className="mt-1.5 space-y-0.5">
            {(season.Lesson ?? []).map((lesson) => {
              const lessonId = String(lesson.id);
              const selected = lessonId === selectedLessonId;
              const completed = completedLessonIds.has(lessonId);
              const published = lesson.is_published !== false;
              const Icon = TYPE_ICON[lesson.lesson_type ?? "TEXT"] ?? FileText;
              const duration = formatSeconds(lesson.duration, language, t);

              if (!published) {
                return (
                  <li key={lessonId}>
                    <span className="flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-muted-foreground/70">
                      <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{lesson.title}</span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={lessonId}>
                  <Link
                    href={buildAcademyPath(
                      storeSlug,
                      `/learn/${courseId}/${lessonId}`,
                    )}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "group flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      selected
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                        completed
                          ? "bg-primary/15 text-primary"
                          : selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      ) : (
                        toPersianDigits(numbers.get(lessonId) ?? 0, language)
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{lesson.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground">
                        <Icon className="size-3" aria-hidden="true" />
                        {duration || t(`courses.kind${titleCase(lesson.lesson_type)}`)}
                      </span>
                    </span>

                    {lesson.is_free ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        {t("courses.free")}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </nav>
  );
}

function titleCase(type: LessonType | null | undefined): string {
  const value = type ?? "TEXT";
  return value.charAt(0) + value.slice(1).toLowerCase();
}
