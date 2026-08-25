import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  /** ReactNode so a heading can wrap a word in <CircledWord>. */
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "start";
  /** A standalone page needs the section title as its h1. */
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Heading = "h2",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "mx-auto max-w-[720px] items-center text-center"
          : "items-start",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full border border-lp-mint/40 bg-lp-mint/10 px-3.5 py-1.5 text-xs font-bold text-lp-ink">
          {eyebrow}
        </span>
      ) : null}

      <Heading className="text-balance text-[30px] font-extrabold leading-tight tracking-[-0.022em] text-lp-ink sm:text-[38px] lg:text-[46px]">
        {title}
      </Heading>

      {subtitle ? (
        <p className="max-w-[560px] text-pretty text-base leading-[1.85] text-lp-muted lg:text-[17px]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
