"use client";

import { useEffect } from "react";

// Scroll-reveal for platform landing page sections.
// Uses IntersectionObserver + CSS classes — no GSAP, no bundle cost.
// Hero section (first child of main) is never hidden to protect LCP.
export function LandingScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mainEl = document.querySelector<HTMLElement>("#top main");
    if (!mainEl) return;

    const sections = Array.from(mainEl.children) as HTMLElement[];
    // Skip the hero (first section) — it's above the fold and owns LCP
    const belowFold = sections.slice(1);

    belowFold.forEach((el) => el.classList.add("mtm-section-hidden"));

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("mtm-section-hidden");
            e.target.classList.add("mtm-section-shown");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -48px 0px" }
    );

    belowFold.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  return null;
}
