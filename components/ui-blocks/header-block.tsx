"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

interface HeaderBlockProps {
  id?: string;
  config?: {
    showLogo?: boolean;
    showNavigation?: boolean;
    navigationStyle?: "horizontal" | "vertical";
    sticky?: boolean;
    transparent?: boolean;
    compact?: boolean;
    minimal?: boolean;
  };
}

export function HeaderBlock({ id, config }: HeaderBlockProps) {
  const sticky = config?.sticky !== false;
  const transparent = config?.transparent === true;
  const compact = config?.compact === true;
  const minimal = config?.minimal === true;

  return (
    <header
      id={id || "header"}
      className={cn(
        sticky && "sticky top-0 z-50",
        transparent && "absolute left-0 right-0 top-0"
      )}
    >
      <div
        className={cn(
          "w-full border-b transition-all",
          transparent
            ? "border-transparent bg-transparent"
            : "border-slate-200/60 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80",
          compact && "py-2",
          minimal && "border-none bg-transparent"
        )}
      >
        <SiteHeader />
      </div>
    </header>
  );
}

