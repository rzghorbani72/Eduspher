import { forwardRef } from 'react';
import type { CSSProperties, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const textareaBaseStyle: CSSProperties = {
  backgroundColor: 'var(--theme-background)',
  color: 'var(--theme-foreground)',
  caretColor: 'var(--theme-foreground)',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'placeholder:text-muted flex min-h-28 w-full rounded-xl border border-(--theme-foreground)/10',
          'bg-(--theme-background)/70 px-3.5 py-3 text-sm text-(--theme-foreground)',
          'transition-colors placeholder:opacity-70',
          'focus-visible:border-(--theme-primary) focus-visible:ring-2',
          'focus-visible:ring-(--theme-primary)/15 focus-visible:outline-none',
          className,
        )}
        style={{ ...textareaBaseStyle, ...style }}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
