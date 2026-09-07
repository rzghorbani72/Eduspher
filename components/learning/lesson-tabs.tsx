"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export interface LessonTab {
  id: string;
  label: string;
  /** Shown as a pill beside the label; omitted when there is nothing to count. */
  count?: number;
  content: React.ReactNode;
}

interface LessonTabsProps {
  tabs: LessonTab[];
  /** Which tab opens first; falls back to the first tab. */
  defaultTabId?: string;
  countLabel: (count: number) => string;
}

/**
 * The strip under the stage. Only tabs with something in them are passed in, so
 * a lesson with no homework never shows an empty "homework" tab.
 */
export function LessonTabs({
  tabs,
  defaultTabId,
  countLabel,
}: LessonTabsProps) {
  const initial =
    tabs.find((tab) => tab.id === defaultTabId)?.id ?? tabs[0]?.id ?? "";
  const [activeId, setActiveId] = useState(initial);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (tabs.length === 0) return null;

  // One tab is not a choice: showing a strip with a single item reads as a
  // broken control, so the lone panel is rendered on its own.
  if (tabs.length === 1) return <div className="pt-6">{tabs[0]?.content}</div>;

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-[18px] overflow-x-auto border-b border-theme sm:gap-[26px]"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`lesson-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`lesson-panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap py-[15px] text-sm transition-colors",
                selected
                  ? "font-extrabold text-foreground shadow-[inset_0_-3px_0_var(--theme-primary)]"
                  : "font-semibold text-muted hover:text-foreground",
              )}
            >
              {tab.label}
              {typeof tab.count === "number" ? (
                <span className="rounded-full bg-surface-alt px-[7px] py-0.5 text-[11px] font-semibold text-muted">
                  {countLabel(tab.count)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          role="tabpanel"
          id={`lesson-panel-${active.id}`}
          aria-labelledby={`lesson-tab-${active.id}`}
          className="pt-6"
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
