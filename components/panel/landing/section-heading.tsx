import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  eyebrow?: string;
  /** ReactNode so a heading can wrap a word in <CircledWord>. */
  title: ReactNode;
  subtitle?: string;
  align?: 'center' | 'start';
  /** A standalone page needs the section title as its h1. */
  as?: 'h1' | 'h2';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  as: Heading = 'h2',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-[720px] items-center text-center' : 'items-start',
        className,
      )}
    >
      {eyebrow ? (
        <span className="border-lp-mint/40 bg-lp-mint/10 text-lp-ink inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold">
          {eyebrow}
        </span>
      ) : null}

      <Heading className="text-lp-ink text-[30px] leading-tight font-extrabold tracking-[-0.022em] text-balance sm:text-[38px] lg:text-[46px]">
        {title}
      </Heading>

      {subtitle ? (
        <p className="text-lp-muted max-w-[560px] text-base leading-[1.85] text-pretty lg:text-[17px]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
