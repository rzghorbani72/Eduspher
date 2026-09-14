'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

const OVERFLOW_PX = 8;

interface CollapsibleHtmlProps {
  html: string;
  className?: string;
  collapsedClassName: string;
  toggleClassName?: string;
}

export function CollapsibleHtml({
  html,
  className,
  collapsedClassName,
  toggleClassName,
}: CollapsibleHtmlProps) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || expanded) return;

    const measure = () => {
      setCanToggle(el.scrollHeight > el.clientHeight + OVERFLOW_PX);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, expanded]);

  return (
    <div>
      <div
        ref={contentRef}
        className={cn(
          className,
          !expanded && collapsedClassName,
          !expanded && 'overflow-hidden',
          !expanded && canToggle && 'mask-[linear-gradient(to_bottom,black_55%,transparent)]',
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {canToggle ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className={cn(
            'mt-2 text-sm font-bold underline-offset-4 hover:underline',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            toggleClassName,
          )}
        >
          {expanded ? t('courses.showLess') : t('courses.showMore')}
        </button>
      ) : null}
    </div>
  );
}
