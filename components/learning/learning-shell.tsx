"use client";

import { PanelRightClose } from "lucide-react";
import { useMemo, useState } from "react";

import { FreePreviewBanner } from "@/components/learning/free-preview-banner";
import { LearningCurriculum } from "@/components/learning/learning-curriculum";
import { LessonBody } from "@/components/learning/lesson-body";
import { LessonHeader } from "@/components/learning/lesson-header";
import { LessonNavFooter } from "@/components/learning/lesson-nav-footer";
import { Unavailable } from "@/components/learning/unavailable";
import type { LessonSummary, SeasonSummary } from "@/lib/api/types";
import { getLearningLesson, getProgress } from "@/lib/api/learning";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useApiQuery } from "@/hooks/use-api-query";
import { useTranslation } from "@/lib/i18n/hooks";
import {
  completionPercent,
  flattenLessons,
  neighboursOf,
} from "@/lib/learning/lesson-list";
import { cn, toPersianDigits } from "@/lib/utils";

interface LearningShellProps {
  courseId: string;
  courseTitle: string;
  seasons: SeasonSummary[];
  selectedLesson: LessonSummary;
  /** Null when a free lesson is being watched without an enrollment. */
  enrollmentId: string | null;
  currentProfileId: string;
  storeSlug: string | null;
}

export function LearningShell({
  courseId,
  courseTitle,
  seasons,
  selectedLesson,
  enrollmentId,
  currentProfileId,
  storeSlug,
}: LearningShellProps) {
  const { t, language } = useTranslation();
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const lessonId = String(selectedLesson.id);
  const {
    data: lesson,
    error,
    isLoading,
  } = useApiQuery({
    queryKey: ["learning-lesson", lessonId],
    queryFn: (signal) => getLearningLesson(lessonId, { signal }),
  });
  const { data: courseProgress, refresh: refreshCourseProgress } = useApiQuery({
    queryKey: ["course-progress", courseId],
    queryFn: (signal) => getProgress({ courseId }, { signal }),
  });

  const flatLessons = useMemo(() => flattenLessons(seasons), [seasons]);
  const { previous, next, current } = neighboursOf(flatLessons, lessonId);

  const type = (
    lesson?.lesson_type ??
    selectedLesson.lesson_type ??
    "TEXT"
  ).toUpperCase();
  const { progress, initialPosition, heartbeat, complete, saving, saveFailed } =
    useLessonProgress(enrollmentId, lessonId, {
      useVideoHeartbeat: type === "VIDEO",
    });

  const completedLessonIds = new Set(
    courseProgress?.progress
      .filter((item) => item.status === "COMPLETED")
      .map((item) => item.lesson_id) ?? [],
  );
  if (progress?.status === "COMPLETED") completedLessonIds.add(lessonId);
  const percent = completionPercent(
    flatLessons.length,
    completedLessonIds.size,
  );

  const markComplete = async () => {
    const saved = await complete();
    if (saved) await refreshCourseProgress();
  };

  // The server resolves this: the allow_download_* flags are per access route,
  // so only the backend knows which one applies to THIS student. Reading the
  // raw flags here would offer a download the server then refuses.
  const canDownload = lesson?.can_download === true;
  const isPreviewing = enrollmentId === null;

  return (
    <div className="mx-auto max-w-[1500px]">
      <LessonHeader
        courseId={courseId}
        courseTitle={courseTitle}
        lessonTitle={selectedLesson.title}
        storeSlug={storeSlug}
        position={current?.index ?? 0}
        total={flatLessons.length}
        curriculumOpen={curriculumOpen}
        onToggleCurriculum={() => setCurriculumOpen((open) => !open)}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-5">
          {isPreviewing ? (
            <FreePreviewBanner courseId={courseId} storeSlug={storeSlug} />
          ) : null}

          {isLoading ? (
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-muted" />
          ) : error || !lesson ? (
            <Unavailable message={t("learning.lessonUnavailable")} tone="error" />
          ) : (
            <LessonBody
              lesson={lesson}
              lessonId={lessonId}
              type={type}
              currentProfileId={currentProfileId}
              enrollmentId={enrollmentId}
              initialPosition={initialPosition}
              onHeartbeat={heartbeat}
              canDownload={canDownload}
            />
          )}

          <LessonNavFooter
            courseId={courseId}
            storeSlug={storeSlug}
            previous={previous}
            next={next}
            isCompleted={progress?.status === "COMPLETED"}
            saving={saving}
            onComplete={() => void markComplete()}
            canTrackProgress={!isPreviewing}
          />
          {saveFailed ? (
            <p role="alert" className="text-end text-sm text-destructive">
              {t("learning.progressSaveFailed")}
            </p>
          ) : null}
        </main>

        <aside
          className={cn(
            "rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-24 lg:block",
            curriculumOpen ? "block" : "hidden",
          )}
        >
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold">{t("learning.curriculum")}</h2>
              <button
                type="button"
                onClick={() => setCurriculumOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
                aria-label={t("common.close")}
              >
                <PanelRightClose className="size-4" aria-hidden="true" />
              </button>
            </div>
            {/* Progress needs an enrollment to be recorded against, so a preview
                visitor is shown the lesson list without a permanent 0%. */}
            {isPreviewing ? null : (
              <>
                <div
                  className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {t("learning.progressSummary")
                    .replace(
                      "{done}",
                      toPersianDigits(completedLessonIds.size, language),
                    )
                    .replace(
                      "{total}",
                      toPersianDigits(flatLessons.length, language),
                    )}
                </p>
              </>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            <LearningCurriculum
              courseId={courseId}
              seasons={seasons}
              selectedLessonId={lessonId}
              completedLessonIds={completedLessonIds}
              storeSlug={storeSlug}
              lessonLabel={t("learning.curriculum")}
              language={language}
              t={t}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
