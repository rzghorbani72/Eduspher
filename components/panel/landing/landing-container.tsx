import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The single source of truth for landing page gutters and centering.
 *
 * Every section delegates horizontal space to this so the whole page shares one
 * optical edge — sections themselves only own vertical rhythm and background.
 */
const MAX_WIDTH = {
  /** Reading-width column for prose-heavy blocks (FAQ). Still centered in the
      same gutter, so it reads as deliberate rather than misaligned. */
  narrow: "max-w-[840px]",
  default: "max-w-[1240px]",
} as const;

type Props = {
  children: ReactNode;
  width?: keyof typeof MAX_WIDTH;
  className?: string;
};

export function Container({ children, width = "default", className }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-10",
        MAX_WIDTH[width],
        className
      )}
    >
      {children}
    </div>
  );
}
