import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface DataPanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card chrome shared by every list on the account pages. */
export function DataPanel({
  title,
  subtitle,
  actions,
  filters,
  footer,
  children,
  className,
}: DataPanelProps) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <section className={cn('border-theme bg-card rounded-2xl border shadow-sm', className)}>
      {hasHeader ? (
        <header className="border-theme flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
          <div className="space-y-0.5">
            {title ? (
              <h2 className="text-base font-semibold text-(--theme-foreground)">{title}</h2>
            ) : null}
            {subtitle ? <p className="text-muted text-sm">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {filters ? <div className="border-theme border-b px-5 py-3">{filters}</div> : null}
      <div className="p-5">{children}</div>
      {footer ? <div className="border-theme border-t px-5 py-3">{footer}</div> : null}
    </section>
  );
}
