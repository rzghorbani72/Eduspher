'use client';

import { useEffect, useRef } from 'react';

import { SafeHtml } from '@/components/safe-html';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePreviewPlayer } from '@/components/courses/preview-player-context';
import { CourseCoverPlaceholder } from '@/components/courses/course-cover-placeholder';
import { SecureVideoPlayer } from '@/components/media/secure-video-player';
import { AppImage } from '@/components/ui/app-image';

interface CoursePreviewPlayerProps {
  /** Course promo video, shown until the visitor picks a free lesson. */
  promoVideoId: string | null;
  courseId: string;
  coverUrl: string | null;
  courseTitle: string;
  coverAlt: string;
  hasPreviewLessons: boolean;
}

/**
 * The one player on the course page. A free lesson picked in the curriculum
 * replaces its source, title and description here — no second page, no modal.
 */
export function CoursePreviewPlayer({
  promoVideoId,
  courseId,
  coverUrl,
  courseTitle,
  coverAlt,
  hasPreviewLessons,
}: CoursePreviewPlayerProps) {
  const { t } = useTranslation();
  const player = usePreviewPlayer();
  const selected = player?.selected ?? null;
  const videoId = selected?.videoId ?? (selected ? null : promoVideoId);
  const placeholderHeading = selected?.title ?? courseTitle;
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
      <div className="cd-preview-card relative">
        {!coverUrl ? (
          <CourseCoverPlaceholder
            courseId={courseId}
            heading={placeholderHeading}
            className="absolute inset-0"
          />
        ) : null}
        {videoId ? (
          <SecureVideoPlayer
            // Remount on source change so the new video loads and plays.
            key={videoId}
            videoId={videoId}
            title={selected?.title ?? coverAlt}
            poster={coverUrl}
            autoPlay={autoPlay}
            fill
            className="relative z-10 h-full w-full"
          />
        ) : coverUrl ? (
          <AppImage src={coverUrl} alt={coverAlt} preset="cover" fill className="object-cover" />
        ) : null}
        {hasPreviewLessons && (
          <span className="cd-glass absolute end-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-medium">
            {t('courses.freePreview')}
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
          <h2 className="text-base font-extrabold text-(--theme-foreground)">{selected.title}</h2>
          {selected.description && (
            <p className="mt-1 text-[13px] leading-6 text-(--theme-muted)">
              {selected.description}
            </p>
          )}
          {selected.content && (
            <SafeHtml
              html={selected.content}
              className="prose dark:prose-invert mt-3 max-w-none text-(--theme-foreground)"
            />
          )}
        </div>
      )}
    </div>
  );
}
