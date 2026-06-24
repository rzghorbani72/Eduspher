"use client";

import { useEffect } from "react";

// Zarla-style in-canvas editing bridge. Mounted only in the editor preview
// (edit=1). It lets the manager click a rendered section to select it: clicks
// are captured (no navigation), the section gets a dashed outline, and the
// selected block id is posted to the AdminPanel parent, which opens that
// section's edit panel. The parent posts back "highlight" to keep the dashed
// border in sync (e.g. when a section is picked from the sidebar list).
const HOVER = "me-hover";
const SELECTED = "me-selected";

export function PreviewEditBridge() {
  useEffect(() => {
    const blockEl = (target: EventTarget | null): HTMLElement | null => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.dataset && el.dataset.blockId) return el;
        el = el.parentElement;
      }
      return null;
    };

    const onOver = (e: MouseEvent) => {
      const el = blockEl(e.target);
      document
        .querySelectorAll(`.${HOVER}`)
        .forEach((n) => n.classList.remove(HOVER));
      if (el && !el.classList.contains(SELECTED)) el.classList.add(HOVER);
    };

    const onClick = (e: MouseEvent) => {
      const el = blockEl(e.target);
      if (!el) return;
      // In edit mode every click selects the section instead of navigating.
      e.preventDefault();
      e.stopPropagation();
      document
        .querySelectorAll(`.${SELECTED}`)
        .forEach((n) => n.classList.remove(SELECTED));
      el.classList.remove(HOVER);
      el.classList.add(SELECTED);
      window.parent?.postMessage(
        { source: "mentoma-editor", type: "select", blockId: el.dataset.blockId },
        "*",
      );
    };

    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.source !== "mentoma-admin") return;
      if (data.type === "highlight") {
        document
          .querySelectorAll(`.${SELECTED}`)
          .forEach((n) => n.classList.remove(SELECTED));
        if (data.blockId) {
          const el = document.querySelector<HTMLElement>(
            `[data-block-id="${data.blockId}"]`,
          );
          el?.classList.add(SELECTED);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <style>{`
      [data-block-id] { cursor: pointer; }
      .${HOVER} { outline: 2px dashed color-mix(in srgb, #ef4444 60%, transparent); outline-offset: -2px; }
      .${SELECTED} { outline: 2px dashed #ef4444; outline-offset: -2px; position: relative; }
    `}</style>
  );
}
