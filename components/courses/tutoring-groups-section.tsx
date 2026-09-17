'use client';

import { useState } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { seatPriceOfGroup } from '@/lib/courses/live-course';
import { formatCurrencyWithAcademy } from '@/lib/utils';
import { useEnrollmentClosed } from '@/components/academy/enrollment-status-provider';
import { usePurchase } from '@/components/purchase/use-purchase';
import { CheckoutDialog } from '@/components/purchase/checkout-dialog';
import { TutoringGroupCard } from '@/components/courses/tutoring-group-card';
import { ClassPurchaseSummary } from '@/components/courses/class-purchase-summary';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { useSeatHold } from '@/components/purchase/use-seat-hold';
import Link from '@/components/ui/link';
import type { PublicTutoringGroup } from '@/lib/api/server';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { GROUP_CLASSES_ANCHOR_ID } from '@/components/courses/live-course-panel';

interface Props {
  groups: PublicTutoringGroup[];
  currencyConfig: CurrencyConfig | null;
  language: string;
  loginHref: string;
  isLoggedIn: boolean;
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
        {isLoggedIn ? <CreditBalanceNote /> : null}
      </div>

      {!isLoggedIn ? (
        <div className="border-theme bg-card space-y-4 rounded-2xl border p-5 md:p-6">
          <p className="text-sm text-(--theme-foreground)">{t('courses.guestClassesHint')}</p>
          <Link
            href={loginHref}
            className="flex h-11 items-center justify-center rounded-xl bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90"
          >
            {t('courses.liveEnrollLogin')}
          </Link>
          <Link
            href={loginHref.replace('/auth/login', '/auth/register')}
            className="block text-center text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
          >
            {t('auth.registerTitle')}
          </Link>
        </div>
      ) : groups.length ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <TutoringGroupCard
              key={group.id}
              group={group}
              format={format}
              seats={seatsFor(group)}
              pending={pendingKey === group.id}
              onSeatsChange={(seats) => setSeatsByGroup((prev) => ({ ...prev, [group.id]: seats }))}
              onJoin={() => setConfirming(group)}
              enrolledHref={liveClassHref}
              loginHref={loginHref}
              isLoggedIn={isLoggedIn}
              canPurchase={!closed}
            />
          ))}
          {closed ? <p className="text-muted text-sm">{t('courses.enrollmentClosed')}</p> : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

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
