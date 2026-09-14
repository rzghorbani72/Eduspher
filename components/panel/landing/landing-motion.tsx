'use client';

import { useEffect } from 'react';

/** Sections are pinned only on pointer-precise desktop viewports. */
const DESKTOP = '(min-width: 1024px)';

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    let removeRefreshListeners: (() => void) | null = null;

    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const canPin = window.matchMedia(DESKTOP).matches;

      ctx = gsap.context(() => {
        // ── For-you rail: hold the page while the images hand off ───────────
        // The stage (images + the copy that follows them) is pinned, never the
        // whole section: the heading scrolls away normally and the stage takes
        // over once it reaches the top. The copy must be inside the pin, or it
        // sits below the fold and nobody ever sees it change.
        //
        // This trigger reports a CONTINUOUS position (0 → slideCount - 1), not
        // a step, so the panels resize with the scroll instead of jumping at a
        // threshold. The section owns the flex values; here we only measure.
        const forYou = document.querySelector<HTMLElement>('[data-lp="for-you"]');
        const forYouStage = document.querySelector<HTMLElement>('[data-lp="for-you-stage"]');
        const slideCount = Number(forYouStage?.dataset.lpSlideCount ?? 0);

        // Mobile has its own horizontal-scroll carousel (for-you-section.tsx
        // drives `position` from the rail's scrollLeft there), so this
        // vertical-scroll rig is desktop-only — otherwise normal page scroll
        // would also flip slides underneath the swipe gesture.
        if (forYou && forYouStage && slideCount > 1 && canPin) {
          // A tenth of the scroll at each end holds the first/last slide open,
          // so the rail does not start moving the instant the pin engages.
          const HOLD = 0.1;

          ScrollTrigger.create({
            trigger: forYouStage,
            start: 'center center',
            end: `+=${slideCount * 70}%`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const eased = (self.progress - HOLD) / (1 - HOLD * 2);
              const position = Math.min(1, Math.max(0, eased)) * (slideCount - 1);
              forYou.dispatchEvent(new CustomEvent('lp:for-you', { detail: position }));
            },
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
            start: 'center center',
            end: `+=${stepCount * 70}%`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const index = Math.min(stepCount - 1, Math.floor(self.progress * stepCount));
              if (index === current) return;
              current = index;
              steps.dispatchEvent(new CustomEvent('lp:step', { detail: index }));
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
      window.addEventListener('load', onLoad);
      void document.fonts?.ready.then(refresh);

      const railImages =
        document.querySelector<HTMLElement>('[data-lp="for-you-stage"]')?.querySelectorAll('img') ??
        [];
      let pending = 0;
      railImages.forEach((img) => {
        if (img.complete) return;
        pending += 1;
        const done = () => {
          pending -= 1;
          if (pending <= 0) refresh();
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });

      removeRefreshListeners = () => {
        window.removeEventListener('load', onLoad);
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
