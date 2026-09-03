"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Play } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { SecureVideoPlayer } from "./secure-video-player";

interface LazySecureVideoProps {
  videoId: string;
  title: string;
  poster?: string | null;
  className?: string;
}

/**
 * A poster with a play button that only mounts the real player once someone
 * presses it.
 *
 * Two reasons it exists: the pages that use it are server-rendered for SEO, so
 * only this leaf may be a client component; and a public page can hold several
 * videos, where opening a playback session for each on load would spend egress
 * on every anonymous visit for nothing.
 */
export function LazySecureVideo({
  videoId,
  title,
  poster,
  className,
}: LazySecureVideoProps) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <SecureVideoPlayer
        videoId={videoId}
        title={title}
        autoPlay
        fill
        className={className}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`${t("learning.playVideo")}: ${title}`}
      className={`group relative block w-full overflow-hidden bg-black ${className ?? ""}`}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <span className="absolute inset-0 grid place-items-center bg-black/25">
        <span className="grid size-14 place-items-center rounded-full bg-white/90 text-black shadow-lg transition group-hover:scale-110">
          <Play className="size-6 translate-x-[1px]" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
