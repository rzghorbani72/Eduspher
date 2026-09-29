'use client';

import { Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { VideoControls, formatClock } from '@/components/media/video-controls';
import { useSecurePlayback } from './use-secure-playback';
import { VideoPreparingPoster } from './video-preparing-poster';
import { useVideoControls } from '@/components/media/use-video-controls';
import { useTranslation } from '@/lib/i18n/hooks';

interface SecureVideoPlayerProps {
  videoId: string;
  title: string;
  /** Seconds to resume from, 0 for the start. */
  initialPosition?: number;
  onHeartbeat?: (position: number, duration?: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  /** Fill the parent box instead of holding a 16:9 ratio of its own. */
  fill?: boolean;
  /** Shown until the first frame plays — course cover, or the video poster. */
  poster?: string | null;
  className?: string;
}

/**
 * The watermark sits above the control bar, clear of it.
 * `left`, not `end`: this is placed over the video picture, which does not
 * mirror in an RTL page the way the interface around it does.
 */
const WATERMARK_POSITION = 'bottom-[92px] left-[22px]';

/**
 * The one video player for protected content.
 *
 * It never puts a real file URL in `src`: hls.js feeds the element through a
 * MediaSource, so "copy video address" yields a useless `blob:`. The segments it
 * fetches are AES-128 encrypted and the key is a two-minute ticket bound to this
 * viewer, so a copied playlist is dead outside this browser.
 *
 * None of that stops a screen recorder — nothing in a browser does. The
 * watermark is the answer to that: a leaked recording names the account it came
 * from. See ./README.md.
 */
export function SecureVideoPlayer({
  videoId,
  title,
  initialPosition = 0,
  onHeartbeat,
  onEnded,
  autoPlay = false,
  fill = false,
  poster = null,
  className,
}: SecureVideoPlayerProps) {
  const { t, language } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [resumeOffered, setResumeOffered] = useState(initialPosition > 0);
  const [hasStarted, setHasStarted] = useState(false);
  const { session, status } = useSecurePlayback(videoId, videoRef, retryToken, initialPosition);
  const controls = useVideoControls(videoRef, stageRef);
  const posterSrc = poster ?? session?.poster;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0 || status !== 'ready') return;
    const resume = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        video.currentTime = initialPosition;
        return;
      }
      if (initialPosition >= video.duration - 1) {
        video.currentTime = 0;
        setResumeOffered(false);
        return;
      }
      video.currentTime = Math.min(initialPosition, Math.max(0, video.duration - 1));
    };
    if (video.readyState >= 1) {
      resume();
    } else {
      video.addEventListener('loadedmetadata', resume, { once: true });
    }
    return () => video.removeEventListener('loadedmetadata', resume);
  }, [initialPosition, status]);

  useEffect(() => {
    if (!autoPlay || status !== 'ready') return;
    void videoRef.current?.play().catch(() => undefined);
  }, [autoPlay, status]);

  const buffering = status === 'loading' || controls.waiting;
  const shape = fill ? 'h-full w-full' : 'aspect-video w-full';

  if (status === 'error') {
    // Same footprint as the player it replaces, so a failure never resizes the
    // slot it sits in.
    return (
      <div
        className={`flex flex-col justify-center gap-3 rounded-[10px] bg-[#0d0c0c] px-[30px] text-[#f3f2f2] ${shape} ${className ?? ''}`}
      >
        <p className="text-[17px] font-extrabold">{t('learning.videoPlaybackFailedTitle')}</p>
        <p className="text-[13px] text-white/60">{t('learning.videoPlaybackFailed')}</p>
        <button
          type="button"
          onClick={() => setRetryToken((token) => token + 1)}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-(--theme-primary) px-[18px] py-2.5 text-[13px] font-extrabold text-white"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t('learning.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      className={`group relative overflow-hidden rounded-[10px] bg-[#0d0c0c] ${className ?? ''}`}
    >
      <video
        ref={videoRef}
        controlsList="nodownload noremoteplayback"
        onContextMenu={(event) => event.preventDefault()}
        playsInline
        preload="auto"
        poster={posterSrc ?? undefined}
        aria-label={title}
        autoPlay={autoPlay}
        onEnded={onEnded}
        onClick={controls.togglePlay}
        onPlay={() => {
          setResumeOffered(false);
          setHasStarted(true);
        }}
        onTimeUpdate={(event) => {
          if (event.currentTarget.paused) return;
          onHeartbeat?.(
            event.currentTarget.currentTime,
            Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : undefined,
          );
        }}
        className={fill ? 'h-full w-full object-contain' : 'aspect-video w-full'}
      />

      {posterSrc && !hasStarted ? <VideoPreparingPoster src={posterSrc} /> : null}

      {status === 'ready' && !controls.playing && !buffering ? (
        <button
          type="button"
          onClick={controls.togglePlay}
          aria-label={t('learning.play')}
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid size-[84px] place-items-center rounded-full bg-(--theme-primary)/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <Play
              className="size-[30px] translate-x-[2px] text-white"
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
        </button>
      ) : null}

      {status === 'ready' && resumeOffered && !buffering ? (
        <div className="absolute end-[18px] top-[18px] flex items-center gap-3.5 rounded-lg border border-white/15 bg-[rgba(18,17,17,0.82)] px-3.5 py-2.5">
          <RotateCcw className="size-4 text-white/70" aria-hidden="true" />
          <span className="text-[13px] font-bold text-[#f3f2f2]">
            {t('learning.continueFrom').replace('{time}', formatClock(initialPosition, language))}
          </span>
          <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              controls.seekTo(0);
              setResumeOffered(false);
            }}
            className="text-xs text-white/70 hover:text-white"
          >
            {t('learning.startFromBeginning')}
          </button>
        </div>
      ) : null}

      {session?.watermark ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute text-xs tracking-[0.05em] text-white/25 select-none ${WATERMARK_POSITION}`}
        >
          {session.watermark}
        </span>
      ) : null}

      {buffering ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 text-sm text-white/90">
          {t('learning.videoLoading')}
        </span>
      ) : null}

      <VideoControls api={controls} ready={status === 'ready'} />
    </div>
  );
}
