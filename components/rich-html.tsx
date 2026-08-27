'use client';

import { useSyncExternalStore, type ComponentPropsWithoutRef } from 'react';
import { sanitizeRichText } from '@/lib/sanitize';

const subscribeNoop = () => () => {};

type TagName = 'div' | 'p' | 'span' | 'h2';

type RichHtmlProps<T extends TagName = 'div'> = {
  html: string;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'dangerouslySetInnerHTML'>;

/** Sanitized rich HTML from templates — blocks stored XSS in subtitles. */
export function RichHtml<T extends TagName = 'div'>({
  html,
  className,
  as,
  ...rest
}: RichHtmlProps<T>) {
  const Tag = (as ?? 'div') as T;
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const clean = hydrated ? sanitizeRichText(html || '') : '';
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
      {...rest}
    />
  );
}
