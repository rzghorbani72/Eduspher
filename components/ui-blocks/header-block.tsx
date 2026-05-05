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
          "w-full border-b transition-all backdrop-blur-md",
          compact && "py-2",
          (transparent || minimal) && "border-none bg-transparent"
        )}
        style={(!transparent && !minimal) ? {
          backgroundColor: 'color-mix(in srgb, var(--theme-background) 88%, transparent)',
          borderColor: 'var(--theme-border-color)',
        } : undefined}
      >
        <SiteHeader />
      </div>
    </header>
  );
}

