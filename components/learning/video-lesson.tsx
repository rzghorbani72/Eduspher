"use client";

import { Download } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { SecureVideoPlayer } from "@/components/media/secure-video-player";

interface VideoLessonProps {
  title: string;
  videoId?: string | null;
  initialPosition: number;
  onHeartbeat: (position: number, duration?: number) => void;
  /** Only set when the server allows this viewer to save a copy. */
  downloadUrl?: string | null;
  canDownload?: boolean;
}

/**
 * The recorded stage. On a lesson page downloads live in the attachments tab,
 * so the link below is only rendered where a caller passes one.
 */
export function VideoLesson({
  title,
  videoId,
  initialPosition,
  onHeartbeat,
  downloadUrl,
  canDownload = false,
}: VideoLessonProps) {
  const { t } = useTranslation();

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full flex-col justify-center gap-2 rounded-[10px] border border-dashed border-theme bg-surface px-8 text-center">
        <p className="text-base font-extrabold">
          {t("learning.videoUnavailable")}
        </p>
        <p className="text-[13px] text-muted">
          {t("learning.videoUnavailableDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SecureVideoPlayer
        videoId={videoId}
        title={title}
        initialPosition={initialPosition}
        onHeartbeat={onHeartbeat}
        className="shadow-sm"
      />
      {canDownload && downloadUrl ? (
        <a
          href={downloadUrl}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-(--theme-primary-ink) underline-offset-4 hover:underline"
        >
          <Download className="size-4" aria-hidden="true" />
          {t("learning.downloadVideo")}
        </a>
      ) : null}
    </div>
  );
}
