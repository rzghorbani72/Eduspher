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

    // Skip anything GSAP drives (`data-lp`). Pinning applies its own transform
    // to the section, which fights the reveal's translateY: the element gets
    // moved out of the observer's way, never intersects, and would stay stuck
    // at opacity 0 — an invisible section. Reveal or pin, never both.
    // Sections like for-you mark the whole block with data-lp even though the
    // scrubbed scene lives on a child (grow-rail).
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lp-reveal]")
    ).filter((el) => !el.hasAttribute("data-lp"));
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

    // The logo marquee animates transform on a loop. Running it while it is off
    // screen is pure compositor work nobody sees, so gate it on visibility.
    // Separate observer: this one must keep toggling, not unobserve on first hit.
    const marquees = Array.from(
      document.querySelectorAll<HTMLElement>(".lp-marquee-strip")
    );
    const marqueeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.setAttribute(
          "data-visible",
          entry.isIntersecting ? "true" : "false"
        );
      });
    });
    marquees.forEach((el) => marqueeObserver.observe(el));

    return () => {
      observer.disconnect();
      marqueeObserver.disconnect();
    };
  }, []);

  return null;
}
