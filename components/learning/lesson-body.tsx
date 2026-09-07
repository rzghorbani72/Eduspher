"use client";

import { AssignmentPanel } from "@/components/learning/assignment-panel";
import {
  LessonAttachments,
  fileKindOf,
  type LessonFile,
} from "@/components/learning/lesson-attachments";
import { LessonTabs, type LessonTab } from "@/components/learning/lesson-tabs";
import { LiveLesson } from "@/components/learning/live-lesson";
import { VideoLesson } from "@/components/learning/video-lesson";
import { LessonQuiz } from "@/components/quiz/lesson-quiz";
import { SafeHtml } from "@/components/safe-html";
import { Unavailable } from "@/components/learning/unavailable";
import type { LessonDetail } from "@/lib/api/learning";
import { useTranslation } from "@/lib/i18n/hooks";
import { resolveAssetUrl, toPersianDigits } from "@/lib/utils";

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
  /** Shown on the live stage; null when the course has no named teacher. */
  teacherName: string | null;
  /** The title block: it sits under the stage, above the tabs. */
  header: React.ReactNode;
}

/**
 * A lesson is a stage plus a set of tabs. The stage is whatever this lesson is
 * watched or attended in; the tabs carry everything attached to it, and a tab
 * with nothing in it is never rendered.
 */
export function LessonBody({
  lesson,
  lessonId,
  type,
  currentProfileId,
  enrollmentId,
  initialPosition,
  onHeartbeat,
  canDownload,
  teacherName,
  header,
}: LessonBodyProps) {
  const { t, language } = useTranslation();

  const stage =
    type === "VIDEO" ? (
      <VideoLesson
        title={lesson.title}
        videoId={lesson.Video?.id}
        initialPosition={initialPosition}
        onHeartbeat={onHeartbeat}
      />
    ) : type === "LIVE" ? (
      <LiveLesson
        lessonId={lessonId}
        lessonTitle={lesson.title}
        teacherName={teacherName}
      />
    ) : null;

  const documentUrl = resolveAssetUrl(lesson.Document?.publicUrl);
  const videoUrl = resolveAssetUrl(lesson.video_download_url);
  const audioUrl = resolveAssetUrl(lesson.audio_download_url);
  const files: LessonFile[] = canDownload
    ? [
        videoUrl
          ? {
              url: videoUrl,
              title: t("learning.downloadVideo"),
              kind: fileKindOf(videoUrl, "MP4"),
            }
          : null,
        audioUrl
          ? {
              url: audioUrl,
              title: t("learning.downloadAudio"),
              kind: fileKindOf(audioUrl, "MP3"),
            }
          : null,
        documentUrl
          ? {
              url: documentUrl,
              title: lesson.Document?.title ?? t("learning.lessonResource"),
              kind: fileKindOf(documentUrl, "PDF"),
            }
          : null,
      ].filter((file): file is LessonFile => file !== null)
    : [];

  const overview = lesson.content ?? lesson.description ?? "";
  const hasQuiz = Boolean(lesson.Quiz) || type === "QUIZ";
  const hasAssignment = Boolean(lesson.Assignment) || type === "ASSIGNMENT";

  const tabs: LessonTab[] = ([
    overview
      ? {
          id: "overview",
          label: t("learning.tabOverview"),
          content: (
            <SafeHtml
              html={overview}
              className="prose max-w-[64ch] text-[14.5px] leading-[2.05] text-foreground dark:prose-invert"
            />
          ),
        }
      : null,
    files.length > 0
      ? {
          id: "attachments",
          label: t("learning.tabAttachments"),
          count: files.length,
          content: <LessonAttachments files={files} />,
        }
      : null,
    hasAssignment
      ? {
          id: "assignment",
          label: t("learning.tabAssignment"),
          content: enrollmentId ? (
            <AssignmentPanel
              lessonId={lessonId}
              currentProfileId={currentProfileId}
            />
          ) : (
            <Unavailable message={t("learning.assignmentNeedsEnrollment")} />
          ),
        }
      : null,
    hasQuiz
      ? {
          id: "quiz",
          label: t("learning.tabQuiz"),
          content: (
            <LessonQuiz
              lessonId={lessonId}
              currentProfileId={currentProfileId}
            />
          ),
        }
      : null,
  ] as (LessonTab | null)[]).filter((tab): tab is LessonTab => tab !== null);

  const defaultTabId =
    type === "QUIZ" ? "quiz" : type === "ASSIGNMENT" ? "assignment" : "overview";

  return (
    <>
      {/* Only the recorded picture goes edge to edge on a phone; the live
          stage carries cards under it that must keep the page's margin. */}
      {stage ? (
        type === "VIDEO" ? (
          <div className="-mx-4 sm:mx-0 [&>*>*]:rounded-none sm:[&>*>*]:rounded-[10px]">
            {stage}
          </div>
        ) : (
          stage
        )
      ) : null}
      {header}

      {KNOWN_TYPES.includes(type) ? null : (
        <Unavailable message={t("learning.lessonTypeUnavailable")} />
      )}

      {tabs.length > 0 ? (
        <LessonTabs
          tabs={tabs}
          defaultTabId={defaultTabId}
          countLabel={(count) => toPersianDigits(count, language)}
        />
      ) : type === "TEXT" ? (
        <Unavailable message={t("learning.textUnavailable")} />
      ) : null}
    </>
  );
}
