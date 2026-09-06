"use client";

import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import type { FlatLesson } from "@/lib/learning/lesson-list";
import { useTranslation } from "@/lib/i18n/hooks";
import { buildAcademyPath } from "@/lib/utils";

interface LessonNavFooterProps {
  courseId: string;
  storeSlug: string | null;
  previous: FlatLesson | null;
  next: FlatLesson | null;
  isCompleted: boolean;
  saving: boolean;
  onComplete: () => void;
  /** Progress belongs to an enrollment; a preview visitor has nothing to record. */
  canTrackProgress: boolean;
}

/**
 * The one place a student moves on from a lesson: finish it, or step to the
 * neighbour. Both live together so the next action is never hunted for.
 */
export function LessonNavFooter({
  courseId,
  storeSlug,
  previous,
  next,
  isCompleted,
  saving,
  onComplete,
  canTrackProgress,
}: LessonNavFooterProps) {
  const { t } = useTranslation();
  const href = (lesson: FlatLesson) =>
    buildAcademyPath(storeSlug, `/learn/${courseId}/${lesson.id}`);

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        {previous ? (
          <Button asChild variant="ghost" size="sm" className="max-w-52">
            <Link href={href(previous)} title={previous.lesson.title}>
              <ChevronLeft className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
              <span className="truncate">{t("learning.previousLesson")}</span>
            </Link>
          </Button>
        ) : null}
        {next ? (
          <Button asChild variant="outline" size="sm" className="max-w-64">
            <Link href={href(next)} title={next.lesson.title}>
              <span className="truncate">{t("learning.nextLesson")}</span>
              <ChevronRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>

      {canTrackProgress ? (
        <Button
          type="button"
          onClick={onComplete}
          disabled={saving || isCompleted}
          variant={isCompleted ? "ghost" : "primary"}
          size="sm"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {isCompleted
            ? t("learning.completed")
            : saving
              ? t("common.saving")
              : t("learning.markComplete")}
        </Button>
      ) : null}
    </div>
  );
}
