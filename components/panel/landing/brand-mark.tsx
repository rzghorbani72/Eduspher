import Image from 'next/image';

import icon from '@/app/icon.png';
import { cn } from '@/lib/utils';

import { LANDING } from './landing.messages';

type Props = {
  size?: 24 | 30;
  className?: string;
};

/** App icon plus wordmark, sized as the landing design draws its mark. */
export function BrandMark({ size = 30, className }: Props) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Image src={icon} alt="" width={size} height={size} priority className="shrink-0" />
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
