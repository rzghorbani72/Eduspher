"use client";

import { useEffect } from "react";

/** Sections are pinned only on pointer-precise desktop viewports. */
const DESKTOP = "(min-width: 1024px)";

/**
 * Owns every scroll-driven animation on the landing page so sections stay
 * declarative markup. Sections opt in with `data-lp="..."` attributes.
 *
 * GSAP is imported dynamically — it must never land in the initial bundle for
 * a marketing page whose LCP is the hero.
 *
 * Pinned sections hold the page still while their own animation plays, then
 * release it. Pinning is deliberately desktop-only: on touch devices it fights
 * momentum scrolling and traps the reader. It is also skipped entirely under
 * `prefers-reduced-motion`, where every section renders in its final state.
 */
export function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    let removeRefreshListeners: (() => void) | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const canPin = window.matchMedia(DESKTOP).matches;

      ctx = gsap.context(() => {
        // ── Hero: hold the page while the globe rotates and zooms ───────────
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
              end: canPin ? "+=90%" : "bottom top",
              pin: canPin,
              pinSpacing: canPin,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        // ── For-you rail: hold the page while the images hand off ───────────
        // Panel 0 starts expanded; each stage expands the next as the previous
        // collapses. Only 3 panels, so animating flex-grow costs little and is
        // the only way to get a true "one opens as the previous closes".
        //
        // Only the media block is pinned, never the whole section: the heading
        // scrolls away normally and the stage takes over once it reaches the
        // top, which reads as "the images hold" rather than "the page froze".
        const rail = document.querySelector<HTMLElement>('[data-lp="grow-rail"]');
        const panels = gsap.utils.toArray<HTMLElement>('[data-lp="grow-panel"]');

        if (rail && panels.length > 1) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rail,
              start: canPin ? "center center" : "top 75%",
              end: canPin ? `+=${panels.length * 55}%` : "bottom 40%",
              pin: canPin,
              pinSpacing: canPin,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          panels.forEach((panel, index) => {
            if (index === 0) return;
            tl.to(panels[index - 1], { flexGrow: 1, ease: "power2.inOut" }, index - 1)
              .to(panel, { flexGrow: 6, ease: "power2.inOut" }, index - 1);
          });
        }

        // ── Steps: each scroll stage advances one step, then the page moves ──
        // GSAP owns the scroll maths; the section owns the React state. They
        // talk through a DOM event so this file stays the single GSAP owner and
        // the section stays a plain component.
        const steps = document.querySelector<HTMLElement>('[data-lp="steps"]');
        const stage = document.querySelector<HTMLElement>('[data-lp="steps-stage"]');
        const stepCount = Number(steps?.dataset.lpStepCount ?? 0);

        if (steps && stage && stepCount > 1 && canPin) {
          let current = -1;

          ScrollTrigger.create({
            trigger: stage,
            start: "center center",
            end: `+=${stepCount * 70}%`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const index = Math.min(
                stepCount - 1,
                Math.floor(self.progress * stepCount)
              );
              if (index === current) return;
              current = index;
              steps.dispatchEvent(
                new CustomEvent("lp:step", { detail: index })
              );
            },
          });
        }
      });

      // PNG screenshots load after first paint; without a refresh the pin
      // maths are computed against empty/narrow panels and the accordion
      // never hands off correctly.
      const refresh = () => ScrollTrigger.refresh();
      refresh();
      const onLoad = () => refresh();
      window.addEventListener("load", onLoad);
      void document.fonts?.ready.then(refresh);

      const growRail = document.querySelector<HTMLElement>(
        '[data-lp="grow-rail"]',
      );
      const railImages = growRail?.querySelectorAll("img") ?? [];
      let pending = 0;
      railImages.forEach((img) => {
        if (img.complete) return;
        pending += 1;
        const done = () => {
          pending -= 1;
          if (pending <= 0) refresh();
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

      removeRefreshListeners = () => {
        window.removeEventListener("load", onLoad);
      };
    };

    void init();

    return () => {
      cancelled = true;
      removeRefreshListeners?.();
      ctx?.revert();
    };
  }, []);

  return null;
}
