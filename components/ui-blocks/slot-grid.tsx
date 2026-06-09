import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buildSlotStyleVars, type SlotStyle } from "@/lib/slot-config";

interface SlotGridProps {
  config?: { slotStyle?: SlotStyle } & Record<string, unknown>;
  /** Natural per-card basis for this section when no override is set (e.g. "320px"). */
  minBasisFallback?: string;
  className?: string;
  children: ReactNode;
}

// Fixed-container grid for slot-based sections. Children flow in a flex-wrap so
// that when slots are hidden the remaining cards expand proportionally. Owner
// size overrides arrive as clamped CSS custom properties; styling is
// theme-variable-only per the design-system contract.
export function SlotGrid({ config, minBasisFallback = "280px", className, children }: SlotGridProps) {
  const vars = buildSlotStyleVars(config?.slotStyle, minBasisFallback);
  const items = Children.toArray(children);

  return (
    <div
      className={cn("flex flex-wrap", className)}
      style={{ gap: "var(--slot-gap, 1.5rem)", ...vars }}
    >
      {items.map((child, i) => (
        <div
          key={i}
          className="min-w-0"
          style={{
            flex: "1 1 var(--slot-basis, 280px)",
            minHeight: "var(--slot-h, auto)",
            padding: "var(--slot-pad, 0px)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Styled empty/placeholder slot — never raw empty space. Shows optional static
// text supplied by the owner via the slot's three-way visibility toggle.
export function PlaceholderCard({ text }: { text?: string }) {
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-(--theme-border-radius) border border-dashed border-(--theme-border-strong) bg-(--theme-surface-alt) p-6 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-(--theme-primary)">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </span>
      {text ? (
        <p className="text-sm font-medium text-(--theme-muted)">{text}</p>
      ) : (
        <p className="text-xs text-(--theme-muted)/70">Coming soon</p>
      )}
    </div>
  );
}
