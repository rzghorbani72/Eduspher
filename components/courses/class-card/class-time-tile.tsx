'use client';

import { BookOpen } from 'lucide-react';

import { firstSlotTimes } from '@/components/courses/class-card/schedule';
import type { PublicTutoringGroup } from '@/lib/api/server';
import { useTranslation } from '@/lib/i18n/hooks';

/** The colored side of a class card: an icon and the class hours. */
export function ClassTimeTile({ group }: { group: Pick<PublicTutoringGroup, 'Slots'> }) {
  const { t, language } = useTranslation();
  const times = firstSlotTimes(group, language);

  return (
    <div className="cd-class-tile relative flex shrink-0 items-center gap-3.5 overflow-hidden px-5 py-3.5 sm:w-32 sm:flex-col sm:justify-center sm:gap-3 sm:px-2.5 sm:py-4">
      <span className="cd-class-icon relative z-10 grid size-14 place-items-center rounded-[18px]">
        <BookOpen className="size-7" aria-hidden="true" />
      </span>
      {times ? (
        <p className="cd-price relative z-10 flex items-center gap-1.5 text-[15px] leading-normal font-black sm:flex-col sm:gap-0 sm:text-center">
          <span>{times.start}</span>
          <span className="text-[11px] font-normal opacity-60">{t('courses.timeTo')}</span>
          <span>{times.end}</span>
        </p>
      ) : null}
    </div>
  );
}
