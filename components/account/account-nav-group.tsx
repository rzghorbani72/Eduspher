'use client';

import { AccountNavItem } from '@/components/account/account-nav-item';
import type { AccountNavSection } from '@/components/account/account-nav-sections';
import { AnimatedHoverIcon } from '@/components/account/animated-hover-icon';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

type AccountNavGroupProps = {
  section: AccountNavSection;
  title: string;
  currentPath: string;
  basePath: string;
  translate: (key: string) => string;
};

export function AccountNavGroup({
  section,
  title,
  currentPath,
  basePath,
  translate,
}: AccountNavGroupProps) {
  const hasActiveChild = section.items.some((item) =>
    currentPath.startsWith(`/account${item.segment}`),
  );
  const [expanded, setExpanded] = useState(true);
  const [hadActiveChild, setHadActiveChild] = useState(hasActiveChild);
  const [hovered, setHovered] = useState(false);

  if (hasActiveChild !== hadActiveChild) {
    setHadActiveChild(hasActiveChild);
    if (hasActiveChild) setExpanded(true);
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-start text-sm font-medium transition-colors',
          hasActiveChild
            ? 'bg-(--theme-primary)/10 font-semibold text-(--theme-primary)'
            : 'text-muted hover:bg-surface hover:text-foreground',
        )}
      >
        <AnimatedHoverIcon icon={section.icon} playing={!hasActiveChild && hovered} size={16} />
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <ChevronRight
          className={cn(
            'text-muted/70 h-3.5 w-3.5 shrink-0 transition-transform duration-150',
            expanded ? 'rotate-90 text-(--theme-primary)' : 'rotate-180',
          )}
        />
      </button>
      {expanded ? (
        <div className="relative ms-4 mt-0.5 space-y-px overflow-visible border-s border-(--theme-foreground)/8 ps-2.5">
          {section.items.map((item) => {
            const href = `${basePath}${item.segment}`;
            const isActive = currentPath.startsWith(`/account${item.segment}`);
            return (
              <AccountNavItem
                key={item.segment}
                href={href}
                label={translate(item.labelKey)}
                isActive={isActive}
                isChild
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
