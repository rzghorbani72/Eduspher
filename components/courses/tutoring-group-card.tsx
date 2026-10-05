'use client';

import type { CSSProperties } from 'react';
import { CalendarDays, Check, UserRound } from 'lucide-react';

import { ClassCardOffers } from '@/components/courses/class-card/class-card-offers';
import { ClassTimeTile } from '@/components/courses/class-card/class-time-tile';
import { ClassWeekRow } from '@/components/courses/class-card/class-week-row';
import { SeatStepper } from '@/components/courses/class-card/seat-stepper';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { PublicGroupSessions } from '@/components/courses/public-group-sessions';
import {
  CLOSED_REASON_KEY,
  canBuyMoreSeats,
  classAccent,
  closedReasonOf,
  groupAnchorId,
  maxSeatsOf,
  seatPriceOfGroup,
  sessionsOfGroup,
} from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import type { PublicTutoringGroup } from '@/lib/api/server';

type Props = {
  group: PublicTutoringGroup;
  index: number;
  selected: boolean;
  /** The private-time request form is on the page. */
  showRequest: boolean;
};

const LOW_SEATS = 5;

/**
 * One scheduled class to pick. Enrolling happens once for the selected class
 * (sidebar / mobile bar); the card only chooses the class and its seat count.
 */
export const TutoringGroupCard = ({ group, index, selected, showRequest }: Props) => {
  const { t, language } = useTranslation();
  const { select, seats, setSeats, canPickSeats, format, isLoggedIn, canPurchase } = useLiveClass();
  const seatPrice = seatPriceOfGroup(group);
  const sessions = sessionsOfGroup(group);
  const sessionLabel =
    sessions > 0
      ? t('courses.sessionCount').replace('{count}', formatNumber(sessions, language))
      : null;
  const termLabel = group.starts_on
    ? group.ends_on
      ? `${t('courses.groupTerm')}: ${formatDate(group.starts_on, language)} – ${formatDate(group.ends_on, language)}`
      : `${t('courses.groupStarts')}: ${formatDate(group.starts_on, language)}`
    : null;
  const closedReason = group.joined ? null : closedReasonOf(group);
  const needed = Math.max(group.min_students - group.seats_taken, 0);
  const held = group.sessions_held ?? 0;
  const canReserveAll =
    isLoggedIn &&
    canPurchase &&
    !group.joined &&
    group.whole_class_booking &&
    group.seats_left > 1 &&
    canBuyMoreSeats(group);
  const accentStyle: CSSProperties & Record<'--ac', string> = { '--ac': classAccent(index) };

  return (
    <article
      id={groupAnchorId(group.id)}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      style={accentStyle}
      onClick={() => select(group.id)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        select(group.id);
      }}
      className={cn(
        'cd-class relative flex cursor-pointer scroll-mt-24 flex-col overflow-hidden rounded-3xl border-[1.5px] transition-shadow sm:flex-row',
        'focus-visible:ring-2 focus-visible:ring-(--theme-primary) focus-visible:outline-none',
        selected && 'cd-class-selected',
      )}
    >
      <ClassTimeTile group={group} />

      <div className="min-w-0 flex-1 px-5 pt-4 pb-4 sm:ps-5 sm:pe-5">
        <header className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-black text-(--theme-foreground)">{group.title}</h3>
            {group.Tutor?.display_name ? (
              <p className="text-muted mt-0.5 flex items-center gap-1 text-xs">
                <UserRound className="size-3.5" aria-hidden="true" />
                {group.Tutor.display_name}
              </p>
            ) : null}
          </div>
          <div className="sm:text-end">
            <p className="cd-price cd-class-ink text-xl font-black whitespace-nowrap">
              {format(seatPrice)}
            </p>
            <small className="text-muted block text-[11px]">
              {sessions > 1
                ? `${t('courses.seatPriceEach')} · ${t('courses.groupPerSession').replace('{price}', format(Math.round(seatPrice / sessions)))}`
                : t('courses.singleSession')}
            </small>
          </div>
        </header>

        <ClassWeekRow group={group} sessionLabel={sessionLabel} />

        {termLabel ? (
          <p className="text-muted mb-3 flex items-center gap-1.5 text-xs">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {termLabel}
          </p>
        ) : null}

        <p className="text-muted text-xs">
          <b
            className={cn(
              'cd-price',
              group.seats_left <= LOW_SEATS ? 'text-red-500' : 'text-emerald-600',
            )}
          >
            {formatNumber(group.seats_left, language)}
          </b>{' '}
          {t('courses.seatsFreeOf').replace('{capacity}', formatNumber(group.capacity, language))}
          {held > 0 && sessions > 0
            ? ` · ${t('courses.groupSessionsHeld')
                .replace('{held}', formatNumber(held, language))
                .replace('{total}', formatNumber(sessions, language))}`
            : null}
        </p>

        {group.status === 'WAITING' && !closedReason ? (
          <p className="cd-class-wait mt-2.5 rounded-[10px] px-3 py-2 text-xs font-medium">
            {needed > 0
              ? `${t('courses.groupWaiting')} (${formatNumber(needed, language)})`
              : t('courses.groupStartingSoon')}
          </p>
        ) : null}
        {closedReason ? (
          <p className="bg-surface mt-2.5 rounded-[10px] px-3 py-2 text-xs text-(--theme-foreground)">
            {t(CLOSED_REASON_KEY[closedReason])}
          </p>
        ) : null}

        {selected && canPickSeats ? (
          <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
            <span className="text-muted text-xs">{t('courses.groupReserveWhole')}</span>
            <SeatStepper value={seats} max={maxSeatsOf(group)} onChange={setSeats} />
          </div>
        ) : null}

        <ClassCardOffers
          seatsLeft={group.seats_left}
          seatPrice={seatPrice}
          format={format}
          onReserveAll={
            canReserveAll
              ? () => {
                  select(group.id);
                  setSeats(group.seats_left, group.id);
                }
              : null
          }
          showRequest={showRequest}
        />

        <PublicGroupSessions sessions={group.sessions} timezone={group.timezone} />
      </div>

      <span className="cd-class-pick absolute end-3.5 top-3.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px]">
        {selected ? <Check className="size-3" aria-hidden="true" /> : null}
        {t(selected ? 'courses.pickedClass' : 'courses.pickClass')}
      </span>
    </article>
  );
};
