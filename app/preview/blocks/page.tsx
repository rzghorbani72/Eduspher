import type { CSSProperties } from "react";
import { getPreviewPreset } from "@/lib/api/server";
import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { buildThemeCssVariables } from "@/lib/theme-apply";
import { PreviewEditBridge } from "@/components/preview/preview-edit-bridge";

// Standalone render surface embedded (scaled) by AdminPanel as gallery-card and
// section-picker thumbnails. Renders a specific preset's blocks — or a single
// block via `only` — with that preset's theme applied. No page chrome (see
// isPreview in app/layout.tsx).
export const dynamic = "force-dynamic";

export default async function PreviewBlocksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const template = typeof sp.template === "string" ? sp.template : undefined;
  const only = typeof sp.only === "string" ? sp.only : undefined;
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const draft = sp.draft === "1";
  const edit = sp.edit === "1";

  if (!template) return null;

  const preset = await getPreviewPreset(template, token, draft);
  if (!preset || !preset.blocks?.length) {
    return (
      <div className="p-4 text-sm text-(--theme-muted)">No preview available</div>
    );
  }

  const blocks = only
    ? preset.blocks.filter((block) => block.id === only)
    : preset.blocks;
  const themeVars = buildThemeCssVariables(preset.theme ?? null);

  // The wrapper owns the full themed canvas (background + text color) so dark
  // presets never show the host layout's light gaps behind a section.
  const canvasStyle: CSSProperties = {
    ...themeVars,
    backgroundColor: "var(--theme-background)",
    color: "var(--theme-foreground)",
    minHeight: "100%",
  } as CSSProperties;

  return (
    <div style={canvasStyle}>
      {edit && <PreviewEditBridge />}
      {blocks.map((block, index) => {
        // Header stays un-animated so its sticky positioning is preserved; every
        // other section fades up in sequence for a lively showcase. In edit mode
        // animation is skipped so a freshly selected section doesn't re-animate.
        const animate = !edit && block.type !== "header";
        return (
          <div
            key={block.id}
            data-block-id={block.id}
            className={animate ? "preview-block-enter" : undefined}
            style={
              animate
                ? ({ animationDelay: `${index * 90}ms` } as CSSProperties)
                : undefined
            }
          >
            <BlocksRenderer
              blocks={[block]}
              includeHeaderFooter
              storeContext={{ id: null, slug: null, name: null }}
            />
          </div>
        );
      })}
    </div>
  );
}
