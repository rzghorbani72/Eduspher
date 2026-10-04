'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export interface ShowMoreList<T> {
  visible: readonly T[];
  hasMore: boolean;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

/** Shows the first `limit` items until the visitor asks for the rest. */
export function useShowMore<T>(
  items: readonly T[],
  limit: number,
  initialExpanded = false,
): ShowMoreList<T> {
  const [expanded, setExpanded] = useState(initialExpanded);
  return {
    visible: expanded ? items : items.slice(0, limit),
    hasMore: items.length > limit,
    expanded,
    setExpanded,
  };
}

export function ShowMoreButton<T>({ list }: { list: ShowMoreList<T> }) {
  const { t } = useTranslation();
  if (!list.hasMore) return null;

  return (
    <button
      type="button"
      aria-expanded={list.expanded}
      onClick={() => list.setExpanded(!list.expanded)}
      className="mx-auto flex cursor-pointer items-center gap-1 text-sm font-bold text-(--theme-primary) underline-offset-4 hover:underline"
    >
      {list.expanded ? t('courses.showLess') : t('courses.showMore')}
      <ChevronDown className={cn('h-4 w-4 transition-transform', list.expanded && 'rotate-180')} />
    </button>
  );
}
