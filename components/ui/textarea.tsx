import { forwardRef } from 'react';
import type { CSSProperties, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const textareaBaseStyle: CSSProperties = {
  backgroundColor: 'var(--theme-surface)',
  borderColor: 'var(--theme-border-color)',
  color: 'var(--theme-foreground)',
  caretColor: 'var(--theme-foreground)',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'border-theme bg-surface placeholder:text-muted flex w-full rounded-lg border px-4 text-sm text-(--theme-foreground) placeholder:opacity-70 focus-visible:border-(--theme-primary) focus-visible:ring-2 focus-visible:ring-(--theme-primary)/20 focus-visible:outline-none',
          className,
        )}
        style={{ ...textareaBaseStyle, ...style }}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
