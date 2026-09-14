import type { SectionTone } from './section';
import { list, type SectionConfig } from './types';
import { editableList, editableItem } from './editable-list';

const TONE_CLASS: Record<Extract<SectionTone, 'deep' | 'brand' | 'accent'>, string> = {
  deep: 'bg-(--theme-deep) text-(--theme-on-deep)',
  brand: 'bg-(--theme-primary) text-(--theme-on-primary)',
  accent: 'bg-(--theme-accent) text-(--theme-on-accent)',
};

export type MarqueeSeparator = 'dot' | 'diamond' | 'square' | 'slash';

const SEPARATOR: Record<MarqueeSeparator, string> = {
  dot: 'size-1.5 rounded-full bg-current/60',
  diamond: 'size-1.5 rotate-45 bg-current/60',
  square: 'size-2 rounded-[3px] bg-current/70',
  slash: 'h-3.5 w-px rotate-12 bg-current/50',
};

interface TemplateMarqueeProps {
  id?: string;
  config?: SectionConfig;
  fallbackItems: readonly string[];
  tone?: keyof typeof TONE_CLASS;
  separator?: MarqueeSeparator;
  bordered?: boolean;
}

/**
 * CSS-only ticker shared by every template — no JS, no images. `mtm-marquee-l`
 * is disabled wholesale under `prefers-reduced-motion` in globals.css, so the
 * band degrades to a static strip rather than moving for anyone who opted out.
 * Decorative by definition, so it is hidden from assistive tech.
 */
export function TemplateMarquee({
  id,
  config,
  fallbackItems,
  tone = 'brand',
  separator = 'dot',
  bordered = true,
}: TemplateMarqueeProps) {
  const items = list<string>(config, 'items', fallbackItems);
  const track = [...items, ...items];

  return (
    <div
      id={id || 'marquee'}
      aria-hidden="true"
      className={`overflow-hidden py-4 ${TONE_CLASS[tone]} ${bordered ? 'border-y border-current/15' : ''}`}
    >
      <div
        className="mtm-marquee-l flex w-max gap-10 hover:[animation-play-state:paused]"
        {...editableList('items', items)}
      >
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-3 text-[15px] font-medium whitespace-nowrap"
          >
            <span className={SEPARATOR[separator]} />
            <span {...editableItem('items', index % items.length)}>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
