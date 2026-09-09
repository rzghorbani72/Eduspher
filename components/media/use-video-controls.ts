"use client";

import { useCallback, useEffect, useState } from "react";

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export interface VideoControlsState {
  playing: boolean;
  current: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  rate: number;
  fullscreen: boolean;
  pipActive: boolean;
  waiting: boolean;
}

export interface VideoControlsApi extends VideoControlsState {
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  seekFraction: (fraction: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  cycleRate: () => void;
  togglePip: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

/**
 * Mirrors one <video> element into React state and exposes the actions the
 * control bar needs. The element stays the source of truth: every setter writes
 * to it and the state follows from its own events, so a change made anywhere
 * (keyboard, PiP window, another control) stays in sync.
 */
export function useVideoControls(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
): VideoControlsApi {
  const [state, setState] = useState<VideoControlsState>({
    playing: false,
    current: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    rate: 1,
    fullscreen: false,
    pipActive: false,
    waiting: false,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const patch = (next: Partial<VideoControlsState>) =>
      setState((prev) => ({ ...prev, ...next }));

    const onTime = () => {
      const end = video.buffered.length
        ? video.buffered.end(video.buffered.length - 1)
        : 0;
      patch({ current: video.currentTime, buffered: end });
    };
    const onMeta = () =>
      patch({
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        volume: video.volume,
        muted: video.muted,
        rate: video.playbackRate,
      });
    const onPlay = () => patch({ playing: true, waiting: false });
    const onPause = () => patch({ playing: false });
    const onWaiting = () => patch({ waiting: true });
    const onCanPlay = () => patch({ waiting: false });
    const onVolume = () => patch({ volume: video.volume, muted: video.muted });
    const onRate = () => patch({ rate: video.playbackRate });
    const onPipOn = () => patch({ pipActive: true });
    const onPipOff = () => patch({ pipActive: false });

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("progress", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onCanPlay);
    video.addEventListener("volumechange", onVolume);
    video.addEventListener("ratechange", onRate);
    video.addEventListener("enterpictureinpicture", onPipOn);
    video.addEventListener("leavepictureinpicture", onPipOff);
    onMeta();

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("progress", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onCanPlay);
      video.removeEventListener("volumechange", onVolume);
      video.removeEventListener("ratechange", onRate);
      video.removeEventListener("enterpictureinpicture", onPipOn);
      video.removeEventListener("leavepictureinpicture", onPipOff);
    };
  }, [videoRef]);

  useEffect(() => {
    const onChange = () =>
      setState((prev) => ({
        ...prev,
        fullscreen: document.fullscreenElement === containerRef.current,
      }));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [containerRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }, [videoRef]);

  const seekTo = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      video.currentTime = Math.min(Math.max(seconds, 0), video.duration);
    },
    [videoRef],
  );

  const seekFraction = useCallback(
    (fraction: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      seekTo(fraction * video.duration);
    },
    [seekTo, videoRef],
  );

  const setVolume = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      const next = Math.min(Math.max(value, 0), 1);
      video.volume = next;
      video.muted = next === 0;
    },
    [videoRef],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, [videoRef]);

  const cycleRate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const index = PLAYBACK_RATES.indexOf(
      video.playbackRate as (typeof PLAYBACK_RATES)[number],
    );
    video.playbackRate =
      PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length] ?? 1;
  }, [videoRef]);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement)
        await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      // A browser may refuse PiP (policy, or no user gesture); the bar stays put.
    }
  }, [videoRef]);

  const toggleFullscreen = useCallback(async () => {
    const box = containerRef.current;
    if (!box) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await box.requestFullscreen();
    } catch {
      // iPhone Safari has no element fullscreen; the inline player still works.
    }
  }, [containerRef]);

  return {
    ...state,
    togglePlay,
    seekTo,
    seekFraction,
    setVolume,
    toggleMute,
    cycleRate,
    togglePip,
    toggleFullscreen,
  };
}
