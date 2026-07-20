"use client";

import { useEffect } from "react";

/**
 * Owns every scroll-driven animation on the landing page so sections stay
 * declarative markup. Sections opt in with `data-lp="..."` attributes.
 *
 * GSAP is imported dynamically — it must never land in the initial bundle for
 * a marketing page whose LCP is the hero.
 */
export function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const earth = document.querySelector<HTMLElement>('[data-lp="hero-earth"]');
        const hero = document.querySelector<HTMLElement>('[data-lp="hero"]');

        if (earth && hero) {
          gsap.to(earth, {
            rotate: 38,
            scale: 1.55,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        const rail = document.querySelector<HTMLElement>('[data-lp="grow-rail"]');
        const panels = gsap.utils.toArray<HTMLElement>('[data-lp="grow-panel"]');

        // Accordion rail: panel 0 starts expanded, each scroll stage hands the
        // expansion to the next panel. Only 3 panels, so the layout cost of
        // animating flex-grow is negligible and it is the only way to get a
        // true "one opens as the previous closes" effect.
        if (rail && panels.length > 1) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rail,
              start: "top 75%",
              end: "bottom 40%",
              scrub: 0.8,
            },
          });

          panels.forEach((panel, index) => {
            if (index === 0) return;
            tl.to(panels[index - 1], { flexGrow: 1, ease: "power2.inOut" }, index - 1)
              .to(panel, { flexGrow: 6, ease: "power2.inOut" }, index - 1);
          });
        }
      });
    };

    void init();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
