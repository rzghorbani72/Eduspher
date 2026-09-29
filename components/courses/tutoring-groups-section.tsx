'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useTranslation } from '@/lib/i18n/hooks';
import {
  canBuyMoreSeats,
  enrollHref,
  groupAnchorId,
  liveRoomHref,
  seatPriceOfGroup,
} from '@/lib/courses/live-course';
import { formatCurrencyWithAcademy } from '@/lib/utils';
import { useEnrollmentClosed } from '@/components/academy/enrollment-status-provider';
import { usePurchase } from '@/components/purchase/use-purchase';
import { CheckoutDialog } from '@/components/purchase/checkout-dialog';
import { TutoringGroupCard } from '@/components/courses/tutoring-group-card';
import { ClassPurchaseSummary } from '@/components/courses/class-purchase-summary';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { useSeatHold } from '@/components/purchase/use-seat-hold';
import { QuickEnrollDialog } from '@/components/courses/quick-enroll/quick-enroll-dialog';
import type { PublicTutoringGroup } from '@/lib/api/server';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { GROUP_CLASSES_ANCHOR_ID } from '@/components/courses/live-course-panel';

interface Props {
  groups: PublicTutoringGroup[];
  currencyConfig: CurrencyConfig | null;
  language: string;
  loginHref: string;
  isLoggedIn: boolean;
  /** Academy staff enter their classes and never buy a seat. */
  isStaff?: boolean;
  /** Where enrolled students open the live classroom. */
  liveClassHref: string;
  /** Present only for a private class opened through its share link. */
  joinCode?: string;
}

/**
 * The scheduled classes of a course. Each one is bought on its own because a
 * class is a commitment to a timetable, not just another price.
 */
export const TutoringGroupsSection = ({
  groups,
  currencyConfig,
  language,
  loginHref,
  isLoggedIn,
  isStaff = false,
  liveClassHref,
  joinCode,
}: Props) => {
  const { t } = useTranslation();
  const closed = useEnrollmentClosed();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({
    loginHref,
  });
  const [seatsByGroup, setSeatsByGroup] = useState<Record<string, number>>({});
  const [confirming, setConfirming] = useState<PublicTutoringGroup | null>(null);
  const [authFor, setAuthFor] = useState<PublicTutoringGroup | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resumeClassId = searchParams.get('class');

  // `?class=<id>` means "start enrolling in this class": the sidebar button
  // sets it, and the sign-in dialog reloads to it so the server sees the new
  // session. Runs after mount because both dialogs portal into document.body.
  useEffect(() => {
    if (!resumeClassId) return;
    const picked = groups.find((group) => group.id === resumeClassId);
    if (picked && !isStaff && canBuyMoreSeats(picked)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the URL once
      (isLoggedIn ? setConfirming : setAuthFor)(picked);
    }
    window.history.replaceState(null, '', `${pathname}#${groupAnchorId(resumeClassId)}`);
  }, [isLoggedIn, isStaff, resumeClassId, groups, pathname]);
  const hold = useSeatHold({
    groupId: confirming?.id ?? null,
    seats: confirming ? (seatsByGroup[confirming.id] ?? 1) : 1,
    joinCode,
    enabled: Boolean(confirming),
  });

  if (!groups.length) return null;

  const format = (amount: number) => formatCurrencyWithAcademy(amount, currencyConfig, 1, language);

  const seatsFor = (group: PublicTutoringGroup) => seatsByGroup[group.id] ?? 1;

  const pay = (
    group: PublicTutoringGroup,
    couponCode: string | undefined,
    provider: string | undefined,
    useCredit: boolean,
  ) => {
    const seats = seatsFor(group);
    return purchase({ tutoring_group_id: group.id }, seatPriceOfGroup(group) * seats, group.id, {
      seats,
      joinCode,
      provider,
      couponCode,
      useCredit,
    });
  };

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
        {!isLoggedIn ? (
          <p className="text-muted text-sm">{t('courses.guestClassesHint')}</p>
        ) : isStaff ? null : (
          <CreditBalanceNote />
        )}
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <TutoringGroupCard
            key={group.id}
            group={group}
            format={format}
            seats={seatsFor(group)}
            pending={pendingKey === group.id}
            onSeatsChange={(seats) => setSeatsByGroup((prev) => ({ ...prev, [group.id]: seats }))}
            onJoin={() => (isLoggedIn ? setConfirming(group) : setAuthFor(group))}
            enrolledHref={liveRoomHref(liveClassHref, group.id)}
            isLoggedIn={isLoggedIn}
            canPurchase={!closed && !isStaff}
          />
        ))}
        {closed ? <p className="text-muted text-sm">{t('courses.enrollmentClosed')}</p> : null}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {authFor ? (
        <QuickEnrollDialog
          classTitle={authFor.title}
          loginHref={loginHref}
          onDone={() => window.location.assign(`${pathname}${enrollHref(authFor.id)}`)}
          onClose={() => setAuthFor(null)}
        />
      ) : null}

      {confirming ? (
        <CheckoutDialog
          selector={{ tutoring_group_id: confirming.id }}
          fallbackAmount={seatPriceOfGroup(confirming) * seatsFor(confirming)}
          fallbackTitle={confirming.title}
          currencyConfig={currencyConfig}
          language={language}
          gateways={gateways}
          extras={{
            seats: seatsFor(confirming),
            ...(joinCode ? { join_code: joinCode } : {}),
          }}
          summary={
            <ClassPurchaseSummary
              group={confirming}
              seats={seatsFor(confirming)}
              seatPrice={seatPriceOfGroup(confirming)}
              format={format}
            />
          }
          hold={hold}
          onPay={(couponCode, provider, useCredit) =>
            pay(confirming, couponCode, provider, useCredit)
          }
          onClose={() => {
            reset();
            setConfirming(null);
          }}
        />
      ) : null}
    </section>
  );
};
