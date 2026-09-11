// No 'use client': a plain <video> with no hooks, so it stays server-renderable.
import type { ReactNode } from 'react';
import { resolveHeroVideoPoster, resolveHeroVideoUrl } from './hero-video-slot';
import type { SectionConfig } from './types';

/**
 * Full-bleed looping video banner — the hero *is* the video. It always plays
 * muted, looping and without controls, so it reads as a moving backdrop rather
 * than a player, and the copy sits on top of a dark wash. Any template hero
 * can wrap itself in this to become a video banner.
 *
 * Reads the same `heroVideoUrl` / `heroVideoPoster` keys the sidebar picker
 * writes; the autoplay flag is ignored on purpose — a banner never pauses.
 */
export function HeroVideoBanner({
  config,
  className = '',
  children,
  placeholder,
}: {
  config?: SectionConfig;
  className?: string;
  children?: ReactNode;
  /** Shown behind the copy until the manager picks a video. */
  placeholder?: ReactNode;
}) {
  const url = resolveHeroVideoUrl(config);
  const poster = resolveHeroVideoPoster(config) ?? undefined;

  return (
    <div
      className={`relative isolate flex min-h-[clamp(520px,78vh,820px)] w-full flex-col overflow-hidden ${className}`}
    >
      {url ? (
        <video
          key={url}
          src={url}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-20">{placeholder}</div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--theme-deep)_82%,transparent),color-mix(in_srgb,var(--theme-deep)_38%,transparent))]"
      />
      {children}
    </div>
  );
}
