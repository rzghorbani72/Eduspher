"use client";

import { useEffect } from "react";

/**
 * Fades sections in as they enter the viewport. IntersectionObserver instead of
 * GSAP because this is the cheap, common case — GSAP is reserved for the two
 * scrubbed scenes in `landing-motion.tsx`.
 *
 * The hero is deliberately excluded: it owns LCP and must paint immediately.
 */
export function SectionReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lp-reveal]")
    );
    if (targets.length === 0) return;

    targets.forEach((el) => el.classList.add("lp-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-shown", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -48px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
