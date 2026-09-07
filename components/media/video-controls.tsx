"use client";

import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef } from "react";

import type { VideoControlsApi } from "@/components/media/use-video-controls";
import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";

/** mm:ss, or h:mm:ss once the video passes an hour. */
export function formatClock(seconds: number, language?: string): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.floor(seconds);
  const s = String(total % 60).padStart(2, "0");
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const text = h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
  return toPersianDigits(text, language);
}

const ICON = "size-[18px] shrink-0 transition-opacity hover:opacity-80";

interface VideoControlsProps {
  api: VideoControlsApi;
  /** Hidden until the video is playable, so the bar never sits on a dead frame. */
  ready: boolean;
}

/**
 * The player's own control bar, in place of the browser's.
 *
 * Everything fills from the RIGHT: this is an RTL interface, so a progress bar
 * that grew from the left would read as counting down.
 */
export function VideoControls({ api, ready }: VideoControlsProps) {
  const { t, language } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);

  const played = api.duration > 0 ? (api.current / api.duration) * 100 : 0;
  const buffered = api.duration > 0 ? (api.buffered / api.duration) * 100 : 0;
  const volume = api.muted ? 0 : api.volume;

  const seekFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    // RTL: the right edge is zero and time grows leftwards.
    api.seekFraction(
      Math.min(Math.max((rect.right - clientX) / rect.width, 0), 1),
    );
  };

  if (!ready) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(8,8,8,0.92)] via-[rgba(8,8,8,0.55)] to-transparent px-[18px] pb-3.5 pt-9">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={t("learning.seek")}
        aria-valuemin={0}
        aria-valuemax={Math.floor(api.duration)}
        aria-valuenow={Math.floor(api.current)}
        aria-valuetext={formatClock(api.current, language)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          seekFromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) seekFromPointer(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") api.seekTo(api.current - 5);
          if (event.key === "ArrowLeft") api.seekTo(api.current + 5);
        }}
        className="group relative h-[5px] w-full cursor-pointer rounded-full bg-white/20"
      >
        <div
          className="absolute end-0 top-0 h-[5px] rounded-full bg-white/30"
          style={{ width: `${buffered}%` }}
        />
        <div
          className="absolute end-0 top-0 h-[5px] rounded-full bg-(--theme-primary)"
          style={{ width: `${played}%` }}
        />
        <div
          className="absolute -top-1 size-[13px] -translate-x-1/2 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.5)] rtl:translate-x-1/2"
          style={{ insetInlineEnd: `calc(${played}% - 6px)` }}
        />
      </div>

      {/* The control row runs left-to-right like any media player: play and the
          clock on the left, the display controls on the right. The page around
          it stays RTL. */}
      <div dir="ltr" className="mt-3 flex items-center gap-4 text-[#f3f2f2]">
        <button
          type="button"
          onClick={api.togglePlay}
          aria-label={api.playing ? t("learning.pause") : t("learning.play")}
        >
          {api.playing ? (
            <Pause className={ICON} fill="currentColor" />
          ) : (
            <Play className={ICON} fill="currentColor" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={api.toggleMute}
            aria-label={api.muted ? t("learning.unmute") : t("learning.mute")}
          >
            {api.muted ? (
              <VolumeX className={ICON} />
            ) : (
              <Volume2 className={ICON} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => api.setVolume(Number(event.target.value))}
            aria-label={t("learning.volume")}
            className="h-1 w-[74px] cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
            style={{
              background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.25) ${volume * 100}%)`,
            }}
          />
        </div>

        <span dir="ltr" className="text-[13px] font-semibold tracking-[0.02em]">
          {formatClock(api.current, language)}
          <span className="opacity-50">
            {" / "}
            {formatClock(api.duration, language)}
          </span>
        </span>

        <span className="flex-1" />

        <button
          type="button"
          onClick={api.cycleRate}
          aria-label={t("learning.playbackSpeed")}
          dir="ltr"
          className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-extrabold"
        >
          {toPersianDigits(
            api.rate.toLocaleString(language === "fa" ? "fa-IR" : "en-US"),
            language,
          )}
          ×
        </button>

        {typeof document !== "undefined" && document.pictureInPictureEnabled ? (
          <button
            type="button"
            onClick={() => void api.togglePip()}
            aria-label={t("learning.pictureInPicture")}
          >
            <PictureInPicture2 className={ICON} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void api.toggleFullscreen()}
          aria-label={
            api.fullscreen ? t("learning.exitFullscreen") : t("learning.fullscreen")
          }
        >
          {api.fullscreen ? (
            <Minimize className={ICON} />
          ) : (
            <Maximize className={ICON} />
          )}
        </button>
      </div>
    </div>
  );
}
