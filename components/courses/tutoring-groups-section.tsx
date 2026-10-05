'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { GROUP_CLASSES_ANCHOR_ID, canBuyMoreSeats } from '@/lib/courses/live-course';
import { TutoringGroupCard } from '@/components/courses/tutoring-group-card';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { ShowMoreButton, useShowMore } from '@/components/courses/show-more';

/**
 * The scheduled classes of a course, as a single-choice list. Enrolling acts
 * on the selected class from the sidebar (desktop) or the bottom bar (mobile).
 */
export const TutoringGroupsSection = () => {
  const { t } = useTranslation();
  const { groups, selected, select, seats, setSeats, format, isLoggedIn, canPurchase } =
    useLiveClass();
  const list = useShowMore(groups, 2);

  if (!groups.length) return null;

  // The selected class stays on screen even when it is past the first few.
  const visible =
    selected && !list.visible.includes(selected) ? [...list.visible, selected] : list.visible;

  return (
    <section
      id={GROUP_CLASSES_ANCHOR_ID}
      className="scroll-mt-24 space-y-4"
      aria-labelledby="group-classes-title"
    >
      <div className="space-y-1">
        <h2 id="group-classes-title" className="text-xl font-bold text-(--theme-foreground)">
          {t('courses.groupClassesTitle')}
        </h2>
        <p className="text-muted text-sm">{t('courses.groupClassesSubtitle')}</p>
        {isLoggedIn ? null : <p className="text-muted text-sm">{t('courses.guestClassesHint')}</p>}
      </div>

      <div role="radiogroup" aria-labelledby="group-classes-title" className="space-y-4">
        {visible.map((group) => {
          const isSelected = group.id === selected?.id;
          return (
            <TutoringGroupCard
              key={group.id}
              group={group}
              format={format}
              selected={isSelected}
              onSelect={() => select(group.id)}
              seats={seats}
              onSeatsChange={setSeats}
              showPricing={isSelected && isLoggedIn && canPurchase && canBuyMoreSeats(group)}
            />
          );
        })}
      </div>
      <ShowMoreButton list={list} />
    </section>
  );
};
