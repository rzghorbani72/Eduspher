import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';

type Props = {
  size?: 24 | 30;
  className?: string;
};

/** The two-triangle mark plus wordmark, exactly as drawn in the landing design. */
export function BrandMark({ size = 30, className }: Props) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="relative block shrink-0" style={{ width: size, height: size }}>
        <span className="bg-lp-blue-2 absolute inset-0 [clip-path:polygon(0_4%,54%_54%,54%_100%,0_100%)]" />
        <span className="bg-lp-mint absolute inset-0 [clip-path:polygon(100%_4%,46%_54%,46%_100%,100%_100%)]" />
      </span>
      <span
        className={cn(
          'text-lp-ink font-extrabold tracking-tight',
          size === 30 ? 'text-[21px]' : 'text-[17px]',
        )}
      >
        {LANDING.nav.brand}
      </span>
    </span>
  );
}
