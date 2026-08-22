import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Set false when GSAP owns this node's transform (hero parallax). */
  lift?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Window chrome around a real product screenshot. Matches AdminPanel's
 * `.stat-card` surface so the shot reads as software, not a pasted image.
 */
export function ProductFrame({
  children,
  className,
  lift = true,
  ...rest
}: Props) {
  return (
    <div
      className={cn("lp-frame flex flex-col", !lift && "lp-frame-static", className)}
      {...rest}
    >
      <div className="lp-frame-bar" aria-hidden="true">
        <span className="lp-frame-dot" />
        <span className="lp-frame-dot" />
        <span className="lp-frame-dot" />
      </div>
      {children}
    </div>
  );
}
