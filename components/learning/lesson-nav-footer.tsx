"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import Link from "@/components/ui/link";
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
  /** Resolves false when the progress could not be saved. */
  onComplete: () => Promise<boolean>;
  /** Progress belongs to an enrollment; a preview visitor has nothing to record. */
  canTrackProgress: boolean;
}

const STEP =
  "flex items-center gap-3 rounded-lg border border-theme px-3.5 py-2.5 text-inherit transition-colors hover:bg-surface";

/**
 * The one place a student moves on from a lesson: finish it, or step to the
 * neighbour. Both live together so the next action is never hunted for, and
 * each step names the lesson it leads to rather than only its direction.
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
  const router = useRouter();
  const href = (lesson: FlatLesson) =>
    buildAcademyPath(storeSlug, `/learn/${courseId}/${lesson.id}`);

  // One button ends the lesson: record it, then move on. A failed save keeps the
  // student here with the error visible — advancing would bury a lost record.
  const completeAndContinue = async () => {
    const saved = await onComplete();
    if (saved && next) router.push(href(next));
  };

  const step = (lesson: FlatLesson, direction: "previous" | "next") => (
    <Link href={href(lesson)} className={`${STEP} max-w-[290px]`}>
      {direction === "previous" ? (
        <ArrowLeft
          className="size-4 shrink-0 text-muted rtl:rotate-180"
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0">
        <span className="block text-[11px] text-muted">
          {direction === "previous"
            ? t("learning.previousLesson")
            : t("learning.nextLesson")}
        </span>
        <span className="block truncate text-[13px] font-bold">
          {lesson.lesson.title}
        </span>
      </span>
      {direction === "next" ? (
        <ArrowRight
          className="size-4 shrink-0 text-muted rtl:rotate-180"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  );

  // On a phone the pair collapses: the primary button already goes to the next
  // lesson, so only a compact "back" square survives beside it.
  const compactPrevious = previous ? (
    <Link
      href={href(previous)}
      aria-label={previous.lesson.title}
      className="grid size-[46px] shrink-0 place-items-center rounded-lg border border-theme text-muted"
    >
      <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
    </Link>
  ) : null;

  return (
    <div className="flex items-center gap-2 border-t border-theme bg-card px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:px-8 sm:py-3.5">
      <div className="sm:justify-self-start">
        <span className="sm:hidden">{compactPrevious}</span>
        <span className="hidden sm:block">
          {previous ? step(previous, "previous") : null}
        </span>
      </div>

      {canTrackProgress ? (
        <button
          type="button"
          onClick={() => void completeAndContinue()}
          disabled={saving}
          className="inline-flex h-[46px] flex-1 items-center justify-center gap-2.5 rounded-lg sm:h-auto sm:flex-none sm:justify-self-center bg-(--theme-primary) px-6 py-3 text-[15px] font-extrabold text-white shadow-[0_6px_18px_color-mix(in_srgb,var(--theme-primary)_30%,transparent)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Check className="size-4" aria-hidden="true" />
          {saving
            ? t("common.saving")
            : isCompleted
              ? next
                ? t("learning.nextLesson")
                : t("learning.completed")
              : next
                ? t("learning.completeAndContinue")
                : t("learning.markComplete")}
        </button>
      ) : (
        <span />
      )}

      <div className="hidden sm:block sm:justify-self-end">
        {next ? step(next, "next") : null}
      </div>
    </div>
  );
}
