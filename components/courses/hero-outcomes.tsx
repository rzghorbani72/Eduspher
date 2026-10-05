'use client';

import { useState } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

const VISIBLE = 2;

/** Every item is in the HTML for crawlers; only the visible slice changes. */
export function HeroOutcomes({ items }: { items: readonly string[] }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > VISIBLE;

  return (
    <div className="mt-2 max-w-[680px]">
      <h2 className="mb-2 text-base font-bold">{t('courses.whatYouWillLearn')}</h2>
      <ul className="space-y-0.5 text-[15px] leading-relaxed">
        {items.map((item, index) => (
          <li
            key={item}
            hidden={!expanded && index >= VISIBLE}
            className={cn(
              'cd-hero-desc',
              hasMore && !expanded && index === VISIBLE - 1 && 'opacity-50',
            )}
          >
            {item}
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="mt-2 cursor-pointer text-[13px] font-bold text-(--theme-primary-ink) hover:underline"
        >
          {expanded ? t('courses.showLess') : t('courses.showMore')}
        </button>
      ) : null}
    </div>
  );
}
