'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { GROUP_CLASSES_ANCHOR_ID } from '@/lib/courses/live-course';
import { TutoringGroupCard } from '@/components/courses/tutoring-group-card';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { ShowMoreButton, useShowMore } from '@/components/courses/show-more';

/**
 * The scheduled classes of a course, as a single-choice list. Enrolling acts
 * on the selected class from the sidebar (desktop) or the bottom bar (mobile).
 */
export const TutoringGroupsSection = () => {
  const { t } = useTranslation();
  const { groups, selected, isLoggedIn, isStaff } = useLiveClass();
  const list = useShowMore(groups, 2);

  if (!groups.length) return null;

  // The selected class stays on screen even when it is past the first few.
  const visible =
    selected && !list.visible.includes(selected) ? [...list.visible, selected] : list.visible;
  // Same rule the page uses to render the request form below the list.
  const showRequest = !isStaff && !groups.some((group) => group.joined);

  return (
    <section
      id={GROUP_CLASSES_ANCHOR_ID}
      className="scroll-mt-24 space-y-3"
      aria-labelledby="group-classes-title"
    >
      <div className="space-y-1">
        <h2 id="group-classes-title" className="text-xl font-black text-(--theme-foreground)">
          {t('courses.pickClassTitle')}
        </h2>
        <p className="text-muted text-[13px]">{t('courses.groupClassesSubtitle')}</p>
        {isLoggedIn ? null : (
          <p className="text-muted text-[13px]">{t('courses.guestClassesHint')}</p>
        )}
      </div>

      <div role="radiogroup" aria-labelledby="group-classes-title" className="space-y-3">
        {visible.map((group) => (
          <TutoringGroupCard
            key={group.id}
            group={group}
            index={groups.indexOf(group)}
            selected={group.id === selected?.id}
            showRequest={showRequest}
          />
        ))}
      </div>
      <ShowMoreButton list={list} />
    </section>
  );
};
