import type { SectionConfig } from './types';

export type HeroAlign = 'center' | 'start' | 'end';

/**
 * Tailwind classes for a centred hero that can also sit on the start or end
 * edge. Logical (start/end) so the same value is right in RTL and LTR.
 */
const ALIGN_CLASSES: Record<
  HeroAlign,
  { text: string; block: string; items: string; justify: string }
> = {
  center: {
    text: 'text-center',
    block: 'mx-auto',
    items: 'items-center',
    justify: 'justify-center',
  },
  start: {
    text: 'text-start',
    block: '',
    items: 'items-start',
    justify: 'justify-start',
  },
  end: {
    text: 'text-end',
    block: 'ms-auto',
    items: 'items-end',
    justify: 'justify-end',
  },
};

export function heroAlign(config: SectionConfig | undefined) {
  const value = config?.textAlign;
  const align: HeroAlign = value === 'start' || value === 'end' ? value : 'center';
  return ALIGN_CLASSES[align];
}
