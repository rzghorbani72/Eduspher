"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
};

/**
 * Lottie backdrop for the hero product frame. Both the player and the JSON are
 * fetched at runtime so neither lands in the initial bundle of a page whose LCP
 * is the hero. Under `prefers-reduced-motion` it renders a single frozen frame.
 */
export function HeroGlobe({ src, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let animation: {
      destroy: () => void;
      goToAndStop: (f: number, isFrame: boolean) => void;
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
      if (reduced) animation.goToAndStop(0, true);
    };

    void load();

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [src]);

  return <div ref={hostRef} aria-hidden className={className} />;
}
