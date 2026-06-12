"use client";

import { useEffect } from "react";
import { toPng } from "html-to-image";

export interface CaptureMessage {
  type: "template-cover-capture";
  template: string;
  only: string | null;
  dataUrl?: string;
  error?: string;
}

interface CaptureSenderProps {
  template: string;
  only?: string;
  failed?: boolean;
}

// Snapshots #capture-root after fonts and images settle and hands the PNG to
// the embedding window. The snapshot must happen here: the parent is
// cross-origin and cannot read this document. targetOrigin is "*" because the
// payload is a render of a public template — nothing sensitive.
export function CaptureSender({ template, only, failed }: CaptureSenderProps) {
  useEffect(() => {
    const post = (payload: Omit<CaptureMessage, "type" | "template" | "only">) =>
      window.parent.postMessage(
        {
          type: "template-cover-capture",
          template,
          only: only ?? null,
          ...payload,
        } satisfies CaptureMessage,
        "*",
      );

    if (failed) {
      post({ error: "not-found" });
      return;
    }

    let cancelled = false;
    (async () => {
      const root = document.getElementById("capture-root");
      if (!root) {
        post({ error: "no-root" });
        return;
      }
      await document.fonts.ready;
      await Promise.all(
        Array.from(root.querySelectorAll("img")).map((img) =>
          img.decode().catch(() => undefined),
        ),
      );
      // Let entrance animations and lazy effects settle before snapshotting.
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (cancelled) return;
      try {
        const dataUrl = await toPng(root, {
          width: root.offsetWidth,
          height: root.offsetHeight,
          pixelRatio: 1,
          cacheBust: true,
        });
        post({ dataUrl });
      } catch {
        post({ error: "capture-failed" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [template, only, failed]);

  return null;
}
