'use client';

import { CalendarClock, ListChecks, NotebookPen, Video } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export type LiveTabKey = 'homework' | 'afterClass' | 'syllabus' | 'sessions';

interface LiveRoomTabsProps {
  value: LiveTabKey;
  onChange: (tab: LiveTabKey) => void;
}

export function LiveRoomTabs({ value, onChange }: LiveRoomTabsProps) {
  const { t } = useTranslation();
  const tabs: { key: LiveTabKey; label: string; icon: typeof Video }[] = [
    { key: 'homework', label: t('live.tabHomework'), icon: NotebookPen },
    { key: 'afterClass', label: t('live.tabRecordings'), icon: Video },
    { key: 'syllabus', label: t('live.tabSyllabus'), icon: ListChecks },
    { key: 'sessions', label: t('live.tabSessions'), icon: CalendarClock },
  ];

  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto border-b border-(--theme-hairline) p-2"
    >
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            value === key
              ? 'bg-(--theme-primary)/10 text-(--theme-primary)'
              : 'text-muted hover:bg-surface',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
