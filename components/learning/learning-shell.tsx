"use client";

import useSWR from "swr";
import { CheckCircle2, Menu, PanelRightClose } from "lucide-react";
import { useState } from "react";

import { AssignmentPanel } from "@/components/learning/assignment-panel";
import { LearningCurriculum } from "@/components/learning/learning-curriculum";
import { LiveLesson } from "@/components/learning/live-lesson";
import { VideoLesson } from "@/components/learning/video-lesson";
import { LessonQuiz } from "@/components/quiz/lesson-quiz";
import { SafeHtml } from "@/components/safe-html";
import { Button } from "@/components/ui/button";
import type { LessonSummary, SeasonSummary } from "@/lib/api/types";
import { getLearningLesson, getProgress } from "@/lib/api/learning";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, resolveAssetUrl } from "@/lib/utils";

interface LearningShellProps {
  courseId: string;
  courseTitle: string;
  seasons: SeasonSummary[];
  selectedLesson: LessonSummary;
  enrollmentId: string;
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
  const { t } = useTranslation();
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const lessonId = String(selectedLesson.id);
  const { data: lesson, error, isLoading } = useSWR(
    `learning-lesson:${lessonId}`,
    () => getLearningLesson(lessonId),
  );
  const { data: courseProgress, mutate: refreshCourseProgress } = useSWR(
    `course-progress:${courseId}`,
    () => getProgress({ courseId }),
  );
  const lessonType = (
    selectedLesson.lesson_type ??
    lesson?.lesson_type ??
    "TEXT"
  ).toUpperCase();
  const { progress, initialPosition, heartbeat, complete, saving, saveFailed } =
    useLessonProgress(enrollmentId, lessonId, {
      useVideoHeartbeat: lessonType === "VIDEO",
    });
  const completedLessonIds = new Set(
    courseProgress?.progress
      .filter((item) => item.status === "COMPLETED")
      .map((item) => item.lesson_id) ?? [],
  );
  if (progress?.status === "COMPLETED") completedLessonIds.add(lessonId);

  const markComplete = async () => {
    const saved = await complete();
    if (saved) await refreshCourseProgress();
  };

  const type = (lesson?.lesson_type ?? selectedLesson.lesson_type ?? "TEXT").toUpperCase();
  const documentUrl = resolveAssetUrl(lesson?.Document?.publicUrl);
  const canDownload =
    lesson?.can_download === true ||
    lesson?.allow_download_enrollment === true ||
    lesson?.allow_download_subscription === true ||
    lesson?.allow_download_tutoring === true ||
    lesson?.allow_download_free === true;

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{courseTitle}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            {selectedLesson.title}
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="lg:hidden"
          aria-expanded={curriculumOpen}
          onClick={() => setCurriculumOpen((open) => !open)}
        >
          <Menu className="size-4" aria-hidden="true" />
          {t("learning.curriculum")}
        </Button>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-6">
          {isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          ) : error || !lesson ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {t("learning.lessonUnavailable")}
            </div>
          ) : (
            <>
              {type === "VIDEO" ? (
                <VideoLesson
                  title={lesson.title}
                  source={lesson.Video?.publicUrl}
                  initialPosition={initialPosition}
                  onHeartbeat={heartbeat}
                  canDownload={canDownload}
                />
              ) : null}
              {type === "TEXT" ? (
                lesson.content || lesson.description ? (
                  <SafeHtml
                    html={lesson.content ?? lesson.description ?? ""}
                    className="prose max-w-none rounded-2xl border border-border bg-card p-5 text-foreground shadow-sm dark:prose-invert sm:p-8"
                  />
                ) : (
                  <Unavailable message={t("learning.textUnavailable")} />
                )
              ) : null}
              {type === "LIVE" ? <LiveLesson lessonId={lessonId} /> : null}
              {type === "QUIZ" ? (
                <LessonQuiz lessonId={lessonId} currentProfileId={currentProfileId} />
              ) : null}
              {type === "ASSIGNMENT" ? (
                <AssignmentPanel
                  lessonId={lessonId}
                  enrollmentId={enrollmentId}
                  currentProfileId={currentProfileId}
                />
              ) : null}
              {!["VIDEO", "TEXT", "LIVE", "QUIZ", "ASSIGNMENT"].includes(type) ? (
                <Unavailable message={t("learning.lessonTypeUnavailable")} />
              ) : null}
              {documentUrl ? (
                canDownload ? (
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t("learning.openLessonResource")}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("learning.downloadRestricted")}
                  </p>
                )
              ) : null}
            </>
          )}

          <div className="flex justify-end border-t border-border pt-5">
            <Button
              type="button"
              onClick={() => void markComplete()}
              disabled={saving || progress?.status === "COMPLETED"}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {progress?.status === "COMPLETED"
                ? t("learning.completed")
                : saving
                  ? t("common.saving")
                  : t("learning.markComplete")}
            </Button>
          </div>
          {saveFailed ? (
            <p role="alert" className="text-end text-sm text-destructive">
              {t("learning.progressSaveFailed")}
            </p>
          ) : null}
        </main>

        <aside
          className={cn(
            "rounded-2xl border border-border bg-card p-3 shadow-sm lg:sticky lg:top-24 lg:block",
            curriculumOpen ? "block" : "hidden",
          )}
        >
          <div className="mb-3 flex items-center justify-between px-3 py-2">
            <h2 className="font-semibold">{t("learning.curriculum")}</h2>
            <button
              type="button"
              onClick={() => setCurriculumOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label={t("common.close")}
            >
              <PanelRightClose className="size-4" aria-hidden="true" />
            </button>
          </div>
          <LearningCurriculum
            courseId={courseId}
            seasons={seasons}
            selectedLessonId={lessonId}
            completedLessonIds={completedLessonIds}
            storeSlug={storeSlug}
            lessonLabel={t("learning.curriculum")}
          />
        </aside>
      </div>
    </div>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
