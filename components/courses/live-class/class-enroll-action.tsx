'use client';

import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import Link from '@/components/ui/link';
import {
  CLASS_REQUEST_ANCHOR_ID,
  CLOSED_REASON_KEY,
  canBuyMoreSeats,
  closedReasonOf,
  liveEnterLabelKey,
  liveRoomHref,
} from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';

const baseCta =
  'flex h-12 items-center justify-center rounded-[14px] px-6 text-[15px] font-bold whitespace-nowrap transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';
const primaryCta = `${baseCta} cd-cta-btn`;
const secondaryCta = `${baseCta} border border-(--theme-primary) text-(--theme-primary-ink)`;

/** Why the selected class can't be bought right now, or null when it can (or is mine). */
export function useBlockedReasonKey(): string | null {
  const { selected, enrollmentClosed } = useLiveClass();
  if (!selected || selected.joined) return null;
  const reason = closedReasonOf(selected);
  if (reason) return CLOSED_REASON_KEY[reason];
  return enrollmentClosed ? 'courses.enrollmentClosed' : null;
}

/** The page's one enroll / enter action, for the selected class. */
export function ClassEnrollAction({ inline = false }: { inline?: boolean }) {
  const { t } = useTranslation();
  const {
    groups,
    selected,
    seats,
    enroll,
    pending,
    error,
    isStaff,
    canPurchase,
    hasAccess,
    liveClassHref,
  } = useLiveClass();
  const blockedKey = useBlockedReasonKey();
  const layout = inline ? 'flex shrink-0 gap-2' : 'flex flex-col gap-2';

  if (!selected) {
    if (hasAccess) {
      return (
        <Link href={liveClassHref} className={primaryCta}>
          {t('courses.groupEnter')}
        </Link>
      );
    }
    if (isStaff || groups.length) return null;
    return (
      <a href={`#${CLASS_REQUEST_ANCHOR_ID}`} className={primaryCta}>
        {t('courses.requestClassTitle')}
      </a>
    );
  }

  const isMember = Boolean(selected.joined);
  const buyable = canPurchase && canBuyMoreSeats(selected);
  const showBuy = !isStaff && (buyable || !isMember);
  const buyLabel = isMember
    ? 'courses.groupBuyMoreSeats'
    : seats === selected.capacity && selected.capacity > 1
      ? 'courses.groupBookWhole'
      : 'courses.groupJoin';

  return (
    <div className="space-y-2">
      <div className={layout}>
        {isMember ? (
          <Link href={liveRoomHref(liveClassHref, selected.id)} className={primaryCta}>
            {t(liveEnterLabelKey(selected.session_live))}
          </Link>
        ) : null}
        {showBuy ? (
          <button
            type="button"
            disabled={!buyable || pending || selected.seats_left < seats}
            onClick={enroll}
            className={isMember ? secondaryCta : primaryCta}
          >
            {t(buyLabel)}
          </button>
        ) : null}
      </div>
      {!inline && blockedKey ? <p className="text-muted text-xs">{t(blockedKey)}</p> : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
