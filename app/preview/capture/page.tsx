import type { CSSProperties } from "react";
import { getPreviewPreset } from "@/lib/api/server";
import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { buildThemeCssVariables } from "@/lib/theme-apply";
import { CaptureSender } from "./capture-sender";

// Cover-snapshot surface embedded offscreen by AdminPanel's template-covers
// page. Renders the real blocks in a fixed 16:9 frame, then CaptureSender
// snapshots the DOM client-side (same-origin, unlike the embedding parent)
// and posts the PNG back so covers need no manual upload.
export const dynamic = "force-dynamic";

const CAPTURE_WIDTH = 1280;
const CAPTURE_HEIGHT = 720;

export default async function PreviewCapturePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const template = typeof sp.template === "string" ? sp.template : undefined;
  const only = typeof sp.only === "string" ? sp.only : undefined;

  if (!template) return null;

  const preset = await getPreviewPreset(template);
  const blocks = only
    ? (preset?.blocks ?? []).filter((block) => block.id === only)
    : (preset?.blocks ?? []);

  if (!blocks.length) {
    return <CaptureSender template={template} only={only} failed />;
  }

  const themeVars = buildThemeCssVariables(preset?.theme ?? null);

  return (
    <>
      <div
        id="capture-root"
        style={
          {
            ...themeVars,
            width: CAPTURE_WIDTH,
            height: CAPTURE_HEIGHT,
            overflow: "hidden",
          } as CSSProperties
        }
      >
        <BlocksRenderer
          blocks={blocks}
          includeHeaderFooter
          storeContext={{ id: null, slug: null, name: null }}
        />
      </div>
      <CaptureSender template={template} only={only} />
    </>
  );
}
