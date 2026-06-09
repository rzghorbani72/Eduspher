// Slot model — mirror of Backend/src/ui-template/slot-config.ts.
// Keeps fixed-count grids from collapsing on sparse data and applies the
// owner's section-wide, layout-safe sizing overrides.
import type { CSSProperties } from "react";

export type SlotVisibility = "live" | "placeholder" | "hidden";

export interface SlotConfig {
  visibility: SlotVisibility;
  placeholderText?: string;
}

export interface SlotStyle {
  minWidth?: number;
  height?: number;
  padding?: number;
  gap?: number;
}

export const SLOT_STYLE_BOUNDS: Record<keyof SlotStyle, { min: number; max: number }> = {
  minWidth: { min: 160, max: 480 },
  height: { min: 0, max: 640 },
  padding: { min: 0, max: 48 },
  gap: { min: 0, max: 48 },
};

export type ResolvedSlot<T> =
  | { kind: "live"; data: T }
  | { kind: "placeholder"; text?: string };

// Builds the final render list for a fixed-count grid. Live slots consume real
// data in order; when data runs out a live slot gracefully falls back to a
// placeholder so the container never collapses. Hidden slots are omitted so the
// remaining cards expand proportionally.
export function resolveSlots<T>(
  liveItems: readonly T[],
  slots: SlotConfig[] | undefined,
  expectedCount: number,
): ResolvedSlot<T>[] {
  const out: ResolvedSlot<T>[] = [];
  let dataIdx = 0;

  for (let i = 0; i < expectedCount; i++) {
    const visibility = slots?.[i]?.visibility ?? "live";
    if (visibility === "hidden") continue;
    if (visibility === "placeholder") {
      out.push({ kind: "placeholder", text: slots?.[i]?.placeholderText });
      continue;
    }
    if (dataIdx < liveItems.length) {
      out.push({ kind: "live", data: liveItems[dataIdx++] });
    } else {
      out.push({ kind: "placeholder", text: slots?.[i]?.placeholderText });
    }
  }

  return out;
}

function clampVar(value: number, key: keyof SlotStyle): string {
  const { min, max } = SLOT_STYLE_BOUNDS[key];
  return `clamp(${min}px, ${value}px, ${max}px)`;
}

// Section-wide CSS custom properties consumed by <SlotGrid>. Each numeric is
// re-clamped in CSS as a second line of defense against a bad stored value.
export function buildSlotStyleVars(
  style: SlotStyle | undefined,
  fallbackBasis: string,
): CSSProperties {
  const vars: Record<string, string> = {
    "--slot-basis":
      typeof style?.minWidth === "number" ? clampVar(style.minWidth, "minWidth") : fallbackBasis,
    "--slot-gap":
      typeof style?.gap === "number" ? clampVar(style.gap, "gap") : "1.5rem",
  };
  if (typeof style?.height === "number") vars["--slot-h"] = clampVar(style.height, "height");
  if (typeof style?.padding === "number") vars["--slot-pad"] = clampVar(style.padding, "padding");
  return vars as CSSProperties;
}
