import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  title: string;
  /** Number of traffic-light dots in the title bar; 0 hides them. */
  dots?: 0 | 2 | 3;
  /** Renders `title` as an LTR pill (a domain) instead of plain text. */
  titleAsUrl?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
};

/** Browser/app window chrome shared by all product mockups. */
export function MockFrame({
  title,
  dots = 2,
  titleAsUrl = false,
  size = 'md',
  className,
  children,
}: Props) {
  const sm = size === 'sm';
  return (
    <div
      className={cn(
        'border-lp-line overflow-hidden border bg-white',
        sm ? 'rounded-2xl' : 'rounded-[18px]',
        className,
      )}
    >
      <div
        className={cn(
          'bg-lp-bar border-lp-ink/6 flex items-center border-b',
          sm ? 'h-[29px] gap-[5px] px-2.5' : 'h-[34px] gap-[5px] px-3',
        )}
      >
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className={cn('bg-lp-dot rounded-full', sm ? 'size-[7px]' : 'size-2')} />
        ))}
        {titleAsUrl ? (
          <span
            dir="ltr"
            className="text-lp-faint border-lp-line-soft ms-auto rounded-md border bg-white px-[9px] py-0.5 text-[9px]"
          >
            {title}
          </span>
        ) : (
          <span
            className={cn(
              'text-lp-faint',
              dots > 0 && 'ms-auto',
              sm ? 'text-[9px]' : 'text-[10px]',
            )}
          >
            {title}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
