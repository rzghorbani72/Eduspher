"use client";

import { useEffect } from "react";

const SCROLL_KEY = "me-preview-scroll";
/** How long to keep re-asserting the offset while late content lands. */
const RESTORE_WINDOW_MS = 1500;

/**
 * Keeps the preview's scroll offset across the editor's save-triggered reloads.
 *
 * Saving a setting bumps the iframe's `_v=` cache-buster, which is a real
 * navigation: a fresh document that starts at scroll 0. Without this the
 * manager is thrown back to the top on every colour pick or text tweak.
 *
 * The offset is re-asserted for a short window rather than set once, because
 * images and fonts land after first paint and keep growing the document — a
 * single early `scrollTo` would be clamped to a height that does not exist yet.
 */
export function usePreviewScrollMemory(): void {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const saved = Number(sessionStorage.getItem(SCROLL_KEY) ?? "0");
    const deadline = performance.now() + RESTORE_WINDOW_MS;
    let settled = !(saved > 0);

    const reassert = () => {
      if (settled || performance.now() > deadline) return;
      if (Math.abs(window.scrollY - saved) > 1) window.scrollTo(0, saved);
      requestAnimationFrame(reassert);
    };
    if (!settled) requestAnimationFrame(reassert);

    // A real gesture means the user took over — stop fighting them. Listening
    // for input rather than `scroll` is what separates the user's intent from
    // our own programmatic scrolling.
    const release = () => {
      settled = true;
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", release);

    return () => {
      settled = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, []);
}
