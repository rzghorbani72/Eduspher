import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface AccountPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

/** One title treatment for every account page, so the section headings match. */
export function AccountPageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: AccountPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-(--theme-foreground)">
          {Icon ? <Icon className="size-6 text-(--theme-primary-ink)" aria-hidden="true" /> : null}
          {title}
        </h1>
        {description ? <p className="text-muted text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
