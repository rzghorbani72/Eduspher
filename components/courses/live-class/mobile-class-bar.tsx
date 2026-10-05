'use client';

import {
  ClassEnrollAction,
  useBlockedReasonKey,
} from '@/components/courses/live-class/class-enroll-action';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { GROUP_CLASSES_ANCHOR_ID, seatPriceOfGroup } from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';

/** Mobile stand-in for the sidebar: the selected class and its one action, always in reach. */
export function MobileClassBar() {
  const { t } = useTranslation();
  const { selected, seats, format, isLoggedIn, hasAccess } = useLiveClass();
  const blockedKey = useBlockedReasonKey();

  if (!selected && !hasAccess) return null;

  const total = selected
    ? seatPriceOfGroup(selected) * (isLoggedIn && !selected.joined ? seats : 1)
    : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-(--theme-border-color) bg-(--theme-background) px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      {selected ? (
        <a href={`#${GROUP_CLASSES_ANCHOR_ID}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-(--theme-foreground)">{selected.title}</p>
          <p className="text-muted truncate text-xs">
            {blockedKey ? t(blockedKey) : total !== null ? format(total) : null}
          </p>
        </a>
      ) : (
        <p className="line-clamp-2 min-w-0 flex-1 text-xs text-(--theme-foreground)">
          {t('courses.liveHasAccessHint')}
        </p>
      )}
      <ClassEnrollAction inline />
    </div>
  );
}
