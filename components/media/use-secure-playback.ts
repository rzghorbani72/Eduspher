'use client';

import { useEffect, useRef, useState } from 'react';

import { postJson } from '@/lib/api/client';
import { logger } from '@/lib/logging/app-logger';
import { toPlayableMediaUrl } from './playable-media-url';

/**
 * Opens a watch session for one video and keeps an hls.js instance attached to
 * the given <video> element.
 *
 * hls.js is loaded lazily so the ~150 KB parser only reaches browsers that
 * actually play something, and never blocks a page that merely shows a poster.
 */

export type PlaybackTier = 'encrypted' | 'public' | 'legacy';

export interface PlaybackSession {
  tier: PlaybackTier;
  playlistUrl: string;
  poster: string | null;
  watermark: string | null;
  sessionId: string | null;
  expiresAt: string | null;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

export function useSecurePlayback(
  videoId: string | null | undefined,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  /** Bump to open a fresh watch session after a failure. */
  retryToken = 0,
  /** Seconds to start buffering from. Not an effect dep — a new videoId restarts. */
  startPosition = 0,
) {
  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const destroyRef = useRef<(() => void) | null>(null);
  const startAtRef = useRef(startPosition);
  startAtRef.current = startPosition;

  useEffect(() => {
    if (!videoId) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const next = await postJson<PlaybackSession>(`/videos/hls/session/${videoId}`, {});
        if (cancelled) return;
        const playable = {
          ...next,
          playlistUrl: toPlayableMediaUrl(next.playlistUrl),
        };
        setSession(playable);
        await attach(playable);
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        logger.error('Media', 'PlaybackSessionFailed', {
          video_id: videoId,
          error_name: error instanceof Error ? error.name : 'unknown',
        });
      }
    })();

    async function attach(next: PlaybackSession) {
      const element = videoRef.current;
      if (!element) return;

      // MANIFEST_PARSED is not playable: the AES key and first segment still
      // have to land. canplay is the first moment a click will start, not stall.
      const markReady = () => {
        if (!cancelled) setStatus('ready');
      };
      const armCanPlay = () => {
        if (element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          markReady();
          return;
        }
        element.addEventListener('canplay', markReady, { once: true });
      };

      // Not converted yet: play the original route rather than show a dead player.
      if (next.tier === 'legacy') {
        element.preload = 'auto';
        element.src = next.playlistUrl;
        armCanPlay();
        destroyRef.current = () => element.removeEventListener('canplay', markReady);
        return;
      }

      // iOS Safari has no Media Source Extensions, so hls.js cannot run there.
      // Native HLS works because every ticket travels in the URL, not a header.
      const { default: Hls } = await import('hls.js');
      if (!Hls.isSupported()) {
        if (element.canPlayType('application/vnd.apple.mpegurl')) {
          element.preload = 'auto';
          element.src = next.playlistUrl;
          armCanPlay();
          destroyRef.current = () => element.removeEventListener('canplay', markReady);
          return;
        }
        setStatus('error');
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        autoStartLoad: false,
        // A lesson segment is several MB, and our students watch on slow mobile
        // links while the bytes may still be proxied from object storage. The
        // stock 20s fragment timeout gives up on a connection that is merely
        // slow rather than broken, which reads to the student as "video failed".
        manifestLoadingTimeOut: 30_000,
        levelLoadingTimeOut: 30_000,
        fragLoadingTimeOut: 120_000,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingMaxRetry: 6,
      });
      hls.loadSource(next.playlistUrl);
      hls.attachMedia(element);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        const duration = Number.isFinite(element.duration) ? element.duration : 0;
        let start = startAtRef.current;
        if (duration > 0 && start >= duration - 1) start = 0;
        hls.startLoad(start > 0 ? start : -1);
        armCanPlay();
      });

      // A fatal network or media error is usually a hiccup, not a dead video.
      // Try to resume a bounded number of times before giving up, so one lost
      // segment does not end the lesson.
      let recoveries = 0;
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (recoveries < 2 && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          recoveries += 1;
          hls.startLoad();
          return;
        }
        if (recoveries < 2 && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          recoveries += 1;
          hls.recoverMediaError();
          return;
        }
        setStatus('error');
        logger.error('Media', 'PlayerError', {
          video_id: videoId ?? 'unknown',
          error_type: data.type,
          error_details: data.details,
        });
      });

      destroyRef.current = () => {
        element.removeEventListener('canplay', markReady);
        hls.destroy();
      };
    }

    return () => {
      cancelled = true;
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, [videoId, videoRef, retryToken]);

  return { session, status };
}
