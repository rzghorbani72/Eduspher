import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';
import type { CSSProperties, SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

// The page is light-themed; without this the OS dark scheme paints the native
// option popup dark while text stays dark → unreadable.
const selectBaseStyle: CSSProperties = {
  colorScheme: 'light',
  backgroundColor: 'var(--theme-surface)',
  borderColor: 'var(--theme-border-color)',
  color: 'var(--theme-foreground)',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, style, children, ...props }, ref) => (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        className="bg-surface h-11 w-full cursor-pointer appearance-none rounded-xl border ps-4 pe-10 text-sm font-semibold text-(--theme-foreground) transition-colors focus-visible:border-(--theme-primary) focus-visible:ring-2 focus-visible:ring-(--theme-primary)/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-(--theme-surface) [&>option]:text-(--theme-foreground)"
        style={{ ...selectBaseStyle, ...style }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="text-muted pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  ),
);

Select.displayName = 'Select';
