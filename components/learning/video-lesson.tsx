"use client";

import { Download } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { SecureVideoPlayer } from "@/components/media/secure-video-player";

interface VideoLessonProps {
  title: string;
  videoId?: string | null;
  /** Only set when the server allows this student to save a copy. */
  downloadUrl?: string | null;
  initialPosition: number;
  onHeartbeat: (position: number) => void;
  canDownload?: boolean;
}

export function VideoLesson({
  title,
  videoId,
  downloadUrl,
  initialPosition,
  onHeartbeat,
  canDownload = false,
}: VideoLessonProps) {
  const { t } = useTranslation();

  if (!videoId) {
    return (
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {t("learning.videoUnavailable")}
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <Download className="size-4" aria-hidden="true" />
          {t("learning.downloadVideo")}
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("learning.downloadRestricted")}
        </p>
      )}
    </div>
  );
}
