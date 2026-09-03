"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";

import { SafeHtml } from "@/components/safe-html";
import { useTranslation } from "@/lib/i18n/hooks";
import { usePreviewPlayer } from "@/components/courses/preview-player-context";
import { SecureVideoPlayer } from "@/components/media/secure-video-player";

interface CoursePreviewPlayerProps {
  /** Course promo video, shown until the visitor picks a free lesson. */
  promoVideoId: string | null;
  coverUrl: string;
  coverAlt: string;
  hasPreviewLessons: boolean;
}

/**
 * The one player on the course page. A free lesson picked in the curriculum
 * replaces its source, title and description here — no second page, no modal.
 */
export function CoursePreviewPlayer({
  promoVideoId,
  coverUrl,
  coverAlt,
  hasPreviewLessons,
}: CoursePreviewPlayerProps) {
  const { t } = useTranslation();
  const player = usePreviewPlayer();
  const selected = player?.selected ?? null;
  const videoId = selected?.videoId ?? (selected ? null : promoVideoId);
  const audioUrl = selected?.audioUrl ?? null;
  const autoPlay = player?.autoPlay ?? false;
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);

  // Picking a lesson should start it. `autoPlay` alone does not fire when the
  // same element stays mounted, so play it explicitly on every change.
  useEffect(() => {
    if (!autoPlay) return;
    void mediaRef.current?.play().catch(() => undefined);
  }, [autoPlay, selected?.lessonId]);

  return (
    <div id="course-preview-player" className="scroll-mt-24">
      <div className="cd-preview-card group relative">
        {videoId ? (
          <SecureVideoPlayer
            // Remount on source change so the new video loads and plays.
            key={videoId}
            videoId={videoId}
            title={selected?.title ?? coverAlt}
            autoPlay={autoPlay}
            fill
            className="h-full w-full"
          />
        ) : (
          <>
            <img
              src={coverUrl}
              alt={coverAlt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="cd-preview-overlay" />
          </>
        )}
        {hasPreviewLessons && (
          <span className="cd-preview-label absolute top-3 end-3 rounded-full px-2 py-0.5 text-[11px] font-medium">
            {t("courses.freePreview")}
          </span>
        )}
      </div>

      {audioUrl && (
        <audio
          key={audioUrl}
          ref={mediaRef}
          src={audioUrl}
          controls
          controlsList="nodownload"
          onContextMenu={(event) => event.preventDefault()}
          autoPlay={autoPlay}
          className="mt-3 w-full"
          aria-label={selected?.title}
        />
      )}

      {selected && (
        <div className="mt-3">
          <h2 className="text-base font-extrabold text-(--theme-foreground)">
            {selected.title}
          </h2>
          {selected.description && (
            <p className="mt-1 text-[13px] leading-6 text-(--theme-muted)">
              {selected.description}
            </p>
          )}
          {selected.content && (
            <SafeHtml
              html={selected.content}
              className="prose mt-3 max-w-none text-(--theme-foreground) dark:prose-invert"
            />
          )}
        </div>
      )}
    </div>
  );
}
