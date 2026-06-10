import type { CSSProperties } from "react";
import { getPreviewPreset } from "@/lib/api/server";
import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { buildThemeCssVariables } from "@/lib/theme-apply";

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

  if (!template) return null;

  const preset = await getPreviewPreset(template, token);
  if (!preset || !preset.blocks?.length) {
    return (
      <div className="p-4 text-sm text-(--theme-muted)">No preview available</div>
    );
  }

  const blocks = only
    ? preset.blocks.filter((block) => block.id === only)
    : preset.blocks;
  const themeVars = buildThemeCssVariables(preset.theme ?? null);

  return (
    <div style={themeVars as CSSProperties}>
      <BlocksRenderer
        blocks={blocks}
        includeHeaderFooter
        storeContext={{ id: null, slug: null, name: null }}
      />
    </div>
  );
}
