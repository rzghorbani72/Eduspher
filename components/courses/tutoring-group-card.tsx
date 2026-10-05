'use client';

import { CalendarClock, CircleCheck, Circle, Users } from 'lucide-react';

import { PublicGroupSessions } from '@/components/courses/public-group-sessions';
import { TutoringGroupPricing } from '@/components/courses/tutoring-group-pricing';
import { clockRangeLabel } from '@/components/live/slot-chips';
import {
  CLOSED_REASON_KEY,
  closedReasonOf,
  groupAnchorId,
  seatPriceOfGroup,
  sessionsOfGroup,
} from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import { weekdayLabelKey } from '@/lib/courses/weekly-rule';
import type { PublicTutoringGroup } from '@/lib/api/server';

type Props = {
  group: PublicTutoringGroup;
  format: (amount: number) => string;
  selected: boolean;
  onSelect: () => void;
  seats: number;
  onSeatsChange: (seats: number) => void;
  /** Seat stepper and whole-class price: only for a signed-in buyer on the selected class. */
  showPricing: boolean;
};

/**
 * One scheduled class to pick: timetable, term, remaining seats and price.
 * Enrolling happens once for the selected class (sidebar / mobile bar).
 */
export const TutoringGroupCard = ({
  group,
  format,
  selected,
  onSelect,
  seats,
  onSeatsChange,
  showPricing,
}: Props) => {
  const { t, language } = useTranslation();
  const seatPrice = seatPriceOfGroup(group);
  const waiting = group.status === 'WAITING';
  const needed = Math.max(group.min_students - group.seats_taken, 0);
  const sessions = sessionsOfGroup(group);
  const sessionLabel =
    sessions > 0
      ? t('courses.sessionCount').replace('{count}', formatNumber(sessions, language))
      : null;
  // A student is buying a term, not just a weekday, so print the real dates.
  const termLabel = group.starts_on
    ? group.ends_on
      ? `${t('courses.groupTerm')}: ${formatDate(group.starts_on, language)} – ${formatDate(group.ends_on, language)}`
      : `${t('courses.groupStarts')}: ${formatDate(group.starts_on, language)}`
    : null;
  const termFacts = [sessionLabel, termLabel].filter(Boolean).join(' · ');
  const closedReason = group.joined ? null : closedReasonOf(group);
  const held = group.sessions_held ?? 0;
  const heldLabel =
    held > 0 && sessions > 0
      ? t('courses.groupSessionsHeld')
          .replace('{held}', formatNumber(held, language))
          .replace('{total}', formatNumber(sessions, language))
      : null;

  return (
    <article
      id={groupAnchorId(group.id)}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect();
      }}
      className={cn(
        'bg-card grid cursor-pointer scroll-mt-24 gap-5 rounded-2xl border-2 p-5 transition-colors md:grid-cols-[minmax(0,1fr)_280px]',
        'focus-visible:ring-2 focus-visible:ring-(--theme-primary) focus-visible:outline-none',
        selected ? 'border-(--theme-primary)' : 'border-theme hover:border-(--theme-primary)/50',
      )}
    >
      <div className="space-y-3">
        <header className="flex items-start gap-2">
          {selected ? (
            <CircleCheck
              className="mt-0.5 size-5 shrink-0 text-(--theme-primary)"
              aria-hidden="true"
            />
          ) : (
            <Circle className="text-muted mt-0.5 size-5 shrink-0" aria-hidden="true" />
          )}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-(--theme-foreground)">{group.title}</h3>
            {group.Tutor?.display_name ? (
              <p className="text-muted text-xs">{group.Tutor.display_name}</p>
            ) : null}
          </div>
        </header>

        <ul className="space-y-1.5">
          {group.Slots.map((slot, index) => {
            const key = weekdayLabelKey(slot.weekday);
            return (
              <li key={index} className="flex items-center gap-2 text-sm text-(--theme-foreground)">
                <CalendarClock className="size-4 shrink-0 text-(--theme-primary)" />
                <span>
                  {key ? t(key) : ''}{' '}
                  <span className="cd-price">
                    {clockRangeLabel(slot.start_minute, slot.duration_minutes, language)}
                  </span>
                </span>
                {slot.Lesson ? (
                  <span className="text-muted text-xs">· {slot.Lesson.title}</span>
                ) : null}
              </li>
            );
          })}
        </ul>

        {termFacts ? (
          <p className="text-xs font-medium text-(--theme-foreground)">{termFacts}</p>
        ) : null}

        <PublicGroupSessions sessions={group.sessions} timezone={group.timezone} />

        <div className="text-muted flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {t('courses.groupSeatsLeft')}: {formatNumber(group.seats_left, language)}
          </span>
        </div>

        {waiting ? (
          <p className="rounded-lg bg-(--theme-primary-subtle) px-3 py-2 text-xs text-(--theme-primary-ink)">
            {needed > 0
              ? `${t('courses.groupWaiting')} (${formatNumber(needed, language)})`
              : t('courses.groupStartingSoon')}
          </p>
        ) : null}
      </div>

      <div className="md:border-theme space-y-3 md:border-s md:ps-5">
        {showPricing ? (
          <TutoringGroupPricing
            group={group}
            seatPrice={seatPrice}
            seats={seats}
            format={format}
            onSeatsChange={onSeatsChange}
            buyMore={Boolean(group.joined)}
          />
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="cd-price text-lg font-black whitespace-nowrap text-(--theme-foreground)">
            {format(showPricing ? seatPrice * seats : seatPrice)}
          </span>
          {heldLabel ? <p className="text-muted text-xs">{heldLabel}</p> : null}
          {closedReason ? (
            <p className="rounded-lg bg-(--theme-primary-subtle) px-3 py-2 text-xs text-(--theme-primary-ink)">
              {t(CLOSED_REASON_KEY[closedReason])}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
};
