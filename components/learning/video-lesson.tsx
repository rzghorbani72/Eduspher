"use client";

import { useEffect, useRef } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import { resolveAssetUrl } from "@/lib/utils";

interface VideoLessonProps {
  title: string;
  source?: string | null;
  initialPosition: number;
  onHeartbeat: (position: number) => void;
  canDownload?: boolean;
}

export function VideoLesson({
  title,
  source,
  initialPosition,
  onHeartbeat,
  canDownload = false,
}: VideoLessonProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolvedSource = resolveAssetUrl(source);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0) return;
    const resume = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        video.currentTime = initialPosition;
        return;
      }
      video.currentTime = Math.min(initialPosition, Math.max(0, video.duration - 1));
    };
    video.addEventListener("loadedmetadata", resume, { once: true });
    return () => video.removeEventListener("loadedmetadata", resume);
  }, [initialPosition]);

  if (!resolvedSource) {
    return (
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {t("learning.videoUnavailable")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        src={resolvedSource}
        controls
        controlsList={canDownload ? undefined : "nodownload"}
        onContextMenu={canDownload ? undefined : (event) => event.preventDefault()}
        playsInline
        preload="metadata"
        aria-label={title}
        onTimeUpdate={(event) => {
          if (event.currentTarget.paused) return;
          onHeartbeat(event.currentTarget.currentTime);
        }}
        className="aspect-video w-full rounded-2xl bg-black shadow-sm"
      >
        {t("courses.videoNotSupported")}
      </video>
      {!canDownload ? (
        <p className="text-xs text-muted-foreground">{t("learning.downloadRestricted")}</p>
      ) : null}
    </div>
  );
}
