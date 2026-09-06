"use client";

import { AssignmentPanel } from "@/components/learning/assignment-panel";
import { LiveLesson } from "@/components/learning/live-lesson";
import { VideoLesson } from "@/components/learning/video-lesson";
import { LessonQuiz } from "@/components/quiz/lesson-quiz";
import { SafeHtml } from "@/components/safe-html";
import { Unavailable } from "@/components/learning/unavailable";
import type { LessonDetail } from "@/lib/api/learning";
import { useTranslation } from "@/lib/i18n/hooks";
import { resolveAssetUrl } from "@/lib/utils";

const KNOWN_TYPES = ["VIDEO", "TEXT", "LIVE", "QUIZ", "ASSIGNMENT"];

interface LessonBodyProps {
  lesson: LessonDetail;
  lessonId: string;
  type: string;
  currentProfileId: string;
  enrollmentId: string | null;
  initialPosition: number;
  onHeartbeat: (position: number) => void;
  canDownload: boolean;
}

/** Renders whichever kind of lesson this is. One branch per lesson type. */
export function LessonBody({
  lesson,
  lessonId,
  type,
  currentProfileId,
  enrollmentId,
  initialPosition,
  onHeartbeat,
  canDownload,
}: LessonBodyProps) {
  const { t } = useTranslation();
  const documentUrl = resolveAssetUrl(lesson.Document?.publicUrl);

  return (
    <>
      {type === "VIDEO" ? (
        <VideoLesson
          title={lesson.title}
          videoId={lesson.Video?.id}
          downloadUrl={resolveAssetUrl(lesson.video_download_url)}
          initialPosition={initialPosition}
          onHeartbeat={onHeartbeat}
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
        enrollmentId ? (
          <AssignmentPanel
            lessonId={lessonId}
            currentProfileId={currentProfileId}
          />
        ) : (
          <Unavailable message={t("learning.assignmentNeedsEnrollment")} />
        )
      ) : null}

      {KNOWN_TYPES.includes(type) ? null : (
        <Unavailable message={t("learning.lessonTypeUnavailable")} />
      )}

      {documentUrl && canDownload ? (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("learning.openLessonResource")}
        </a>
      ) : null}
    </>
  );
}
