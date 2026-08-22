"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  /** Playback rate: 1 = the file's own 30fps. Lower is slower. */
  speed?: number;
};

/**
 * Lottie backdrop for the hero product frame. Both the player and the JSON are
 * fetched at runtime so neither lands in the initial bundle of a page whose LCP
 * is the hero. Under `prefers-reduced-motion` it renders a single frozen frame.
 * It turns very slowly on purpose — it is a backdrop, not the subject.
 */
export function HeroGlobe({ src, className, speed = 0.15 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let animation: {
      destroy: () => void;
      goToAndStop: (f: number, isFrame: boolean) => void;
      setSpeed: (speed: number) => void;
    } | null = null;

    const load = async () => {
      const [{ default: lottie }, response] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        fetch(src),
      ]);
      if (cancelled || !response.ok) return;

      const animationData: unknown = await response.json();
      if (cancelled) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      animation = lottie.loadAnimation({
        container: host,
        renderer: "svg",
        loop: !reduced,
        autoplay: !reduced,
        animationData,
      });
      animation.setSpeed(speed);
      if (reduced) animation.goToAndStop(0, true);
    };

    void load();

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [src, speed]);

  return <div ref={hostRef} aria-hidden className={className} />;
}
