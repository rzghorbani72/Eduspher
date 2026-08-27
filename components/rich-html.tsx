'use client';

import {
  useSyncExternalStore,
  type HTMLAttributes,
} from 'react';
import { sanitizeRichText } from '@/lib/sanitize';

const subscribeNoop = () => () => {};

type RichHtmlProps = {
  html: string;
  as?: 'div' | 'p' | 'span' | 'h2';
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML'>;

/** Sanitized rich HTML from templates — blocks stored XSS in subtitles. */
export function RichHtml({ html, as = 'div', className, ...rest }: RichHtmlProps) {
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const clean = hydrated ? sanitizeRichText(html || '') : '';
  const props = {
    className,
    dangerouslySetInnerHTML: { __html: clean },
    ...rest,
  };

  if (as === 'p') return <p {...props} />;
  if (as === 'span') return <span {...props} />;
  if (as === 'h2') return <h2 {...props} />;

  return <div {...props} />;
}
