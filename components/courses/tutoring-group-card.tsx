'use client';

import { CalendarClock, Users } from 'lucide-react';

import { PublicGroupSessions } from '@/components/courses/public-group-sessions';
import { TutoringGroupPricing } from '@/components/courses/tutoring-group-pricing';
import { clockRangeLabel } from '@/components/live/slot-chips';
import {
  CLOSED_REASON_KEY,
  canBuyMoreSeats,
  closedReasonOf,
  groupAnchorId,
  liveEnterLabelKey,
  seatPriceOfGroup,
  sessionsOfGroup,
} from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate, formatNumber } from '@/lib/utils';
import { weekdayLabelKey } from '@/lib/courses/weekly-rule';
import type { PublicTutoringGroup } from '@/lib/api/server';

type Props = {
  group: PublicTutoringGroup;
  format: (amount: number) => string;
  seats: number;
  pending: boolean;
  onSeatsChange: (seats: number) => void;
  onJoin: () => void;
  enrolledHref?: string;
  isLoggedIn: boolean;
  /** False when the academy is not selling new seats (existing members can still enter). */
  canPurchase?: boolean;
};

/**
 * One scheduled class: timetable, remaining seats, enter if already enrolled,
 * and a buy button while registration is still open. Guests get the same
 * button; the section opens the phone-code dialog before checkout.
 */
export const TutoringGroupCard = ({
  group,
  format,
  seats,
  pending,
  onSeatsChange,
  onJoin,
  enrolledHref,
  isLoggedIn,
  canPurchase = true,
}: Props) => {
  const { t, language } = useTranslation();
  const seatPrice = seatPriceOfGroup(group);
  const price = seatPrice * seats;
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
  const isMember = Boolean(group.joined && enrolledHref);
  const canBuy = canPurchase && canBuyMoreSeats(group);
  const closedReason = closedReasonOf(group);
  const held = group.sessions_held ?? 0;
  const heldLabel =
    held > 0 && sessions > 0
      ? t('courses.groupSessionsHeld')
          .replace('{held}', formatNumber(held, language))
          .replace('{total}', formatNumber(sessions, language))
      : null;
  const primaryCta =
    'rounded-lg bg-(--theme-primary) px-4 py-2.5 text-center text-sm font-semibold text-(--theme-on-primary) disabled:opacity-60';
  const secondaryCta =
    'rounded-lg border border-(--theme-primary) px-4 py-2.5 text-center text-sm font-semibold text-(--theme-primary-ink) disabled:opacity-60';
  const buyLabel =
    !isMember && seats === group.capacity && group.capacity > 1
      ? t('courses.groupBookWhole')
      : isMember
        ? t('courses.groupBuyMoreSeats')
        : t('courses.groupJoin');

  return (
    <article
      id={groupAnchorId(group.id)}
      className="border-theme bg-card grid scroll-mt-24 gap-5 rounded-2xl border p-5 md:grid-cols-[minmax(0,1fr)_280px]"
    >
      <div className="space-y-3">
        <header className="space-y-1">
          <h3 className="text-base font-semibold text-(--theme-foreground)">{group.title}</h3>
          {group.Tutor?.display_name ? (
            <p className="text-muted text-xs">{group.Tutor.display_name}</p>
          ) : null}
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
        {isLoggedIn && canBuy ? (
          <TutoringGroupPricing
            group={group}
            seatPrice={seatPrice}
            seats={seats}
            format={format}
            onSeatsChange={onSeatsChange}
            buyMore={isMember}
          />
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="cd-price text-lg font-black whitespace-nowrap text-(--theme-foreground)">
            {format(isLoggedIn && canBuy ? price : seatPrice)}
          </span>
          {heldLabel ? <p className="text-muted text-xs">{heldLabel}</p> : null}
          {isLoggedIn && isMember && enrolledHref ? (
            <a href={enrolledHref} className={primaryCta}>
              {t(liveEnterLabelKey(group.session_live))}
            </a>
          ) : null}
          {canBuy ? (
            <button
              type="button"
              disabled={pending || group.seats_left < seats}
              onClick={onJoin}
              className={isMember ? secondaryCta : primaryCta}
            >
              {buyLabel}
            </button>
          ) : null}
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
