import { CheckCircle2, Circle, LockKeyhole } from "lucide-react";

import Link from "@/components/ui/link";
import type { SeasonSummary } from "@/lib/api/types";
import { cn, buildAcademyPath } from "@/lib/utils";

interface LearningCurriculumProps {
  courseId: string;
  seasons: SeasonSummary[];
  selectedLessonId: string;
  completedLessonIds: ReadonlySet<string>;
  storeSlug: string | null;
  lessonLabel: string;
}

export function LearningCurriculum({
  courseId,
  seasons,
  selectedLessonId,
  completedLessonIds,
  storeSlug,
  lessonLabel,
}: LearningCurriculumProps) {
  return (
    <nav aria-label={lessonLabel} className="space-y-5">
      {seasons.map((season) => (
        <section key={String(season.id)}>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {season.title}
          </h2>
          <ol className="mt-2 space-y-1">
            {(season.Lesson ?? []).map((lesson) => {
              const lessonId = String(lesson.id);
              const selected = lessonId === selectedLessonId;
              const completed = completedLessonIds.has(lessonId);
              const published = lesson.is_published !== false;

              return (
                <li key={lessonId}>
                  {published ? (
                    <Link
                      href={buildAcademyPath(
                        storeSlug,
                        `/learn/${courseId}/${lessonId}`,
                      )}
                      aria-current={selected ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        selected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>{lesson.title}</span>
                    </Link>
                  ) : (
                    <span className="flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground">
                      <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>{lesson.title}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </nav>
  );
}
