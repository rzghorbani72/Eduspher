'use client';

import { useState } from 'react';

import { ClassPurchaseSummary } from '@/components/courses/class-purchase-summary';
import { SlotChips } from '@/components/live/slot-chips';
import { CheckoutDialog } from '@/components/purchase/checkout-dialog';
import { usePurchase } from '@/components/purchase/use-purchase';
import { useSeatHold } from '@/components/purchase/use-seat-hold';
import type { JoinableGroup, MoveToClassResult } from '@/lib/api/account-types';
import { postJson } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';
import { formatCurrency, formatNumber, toPersianDigits } from '@/lib/utils';

interface MoveToClassPanelProps {
  engagementId: string;
  group: JoinableGroup;
  paidValue: number;
  onMoved: () => void;
  onKeepPrivate: () => void;
}

/**
 * Spend the paid 1:1 on seats in this class. What it does not cover is bought
 * as a normal checkout; what is left over stays as store credit. Final.
 */
export function MoveToClassPanel({
  engagementId,
  group,
  paidValue,
  onMoved,
  onKeepPrivate,
}: MoveToClassPanelProps) {
  const { t, language } = useTranslation();
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topUp, setTopUp] = useState<MoveToClassResult['top_up']>(null);
  const { purchase, gateways, reset } = usePurchase({ loginHref: '#' });
  const hold = useSeatHold({
    groupId: group.id,
    seats: topUp?.seats ?? 0,
    enabled: Boolean(topUp),
  });

  const maxSeats = group.whole_class_booking
    ? group.seats_left
    : Math.min(group.seats_left, group.capacity - 1);
  const cost = seats * group.seat_price;
  const remaining = paidValue - cost;
  const fmt = (amount: number) =>
    toPersianDigits(formatCurrency(amount, { divideBy: 1, language }), language);

  const move = async (count: number) => {
    setBusy(true);
    setError(null);
    try {
      const res = await postJson<{ data: MoveToClassResult }>(
        `/tutoring/engagements/${engagementId}/join-group`,
        { group_id: group.id, seats: count },
      );
      logger.ok('Tutoring', 'JoinedClassFromPrivate', {
        group_id: group.id,
        seats: res.data.seats,
        credit_granted: res.data.credit_granted,
      });
      if (res.data.top_up) setTopUp(res.data.top_up);
      else onMoved();
    } catch (err) {
      setError(t('live.joinClassFailed'));
      logger.warn('Tutoring', 'JoinClassFailed', errorFields(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card space-y-4 rounded-2xl border border-(--theme-primary) p-4">
      <div className="space-y-1">
        <p className="text-sm font-bold text-(--theme-foreground)">{group.title}</p>
        <SlotChips slots={group.Slots} />
      </div>

      <dl className="bg-surface grid grid-cols-2 gap-2 rounded-xl p-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted">{t('live.paidValue')}</dt>
          <dd className="font-bold text-(--theme-foreground)">{fmt(paidValue)}</dd>
        </div>
        <div>
          <dt className="text-muted">{t('live.seatsToReserve')}</dt>
          <dd>
            <input
              type="number"
              min={1}
              max={maxSeats}
              dir="ltr"
              value={seats}
              onChange={(e) =>
                setSeats(Math.min(Math.max(Number(e.target.value) || 1, 1), maxSeats))
              }
              className="border-theme w-16 rounded-md border bg-transparent px-2 py-0.5 text-end font-bold"
            />
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t('live.classCost')}</dt>
          <dd className="font-bold text-(--theme-foreground)">{fmt(cost)}</dd>
        </div>
        <div>
          <dt className="text-muted">
            {remaining >= 0 ? t('live.creditRemaining') : t('live.topUpNeeded')}
          </dt>
          <dd className={remaining >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
            {fmt(Math.abs(remaining))}
          </dd>
        </div>
      </dl>

      <p className="text-muted text-[11px]">{t('live.moveFinalNote')}</p>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void move(seats)}
          className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary) disabled:opacity-60"
        >
          {t('live.moveAndReserve').replace('{count}', formatNumber(seats, language))}
        </button>
        {seats > 1 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void move(1)}
            className="rounded-lg border border-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-primary-ink) disabled:opacity-60"
          >
            {t('live.moveKeepCredit')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onKeepPrivate}
          className="text-muted px-3 py-2 text-sm font-semibold underline-offset-4 hover:underline"
        >
          {t('live.keepPrivateAndRequest')}
        </button>
      </div>

      {topUp ? (
        <CheckoutDialog
          selector={{ tutoring_group_id: group.id }}
          fallbackAmount={topUp.seats * topUp.seat_price}
          fallbackTitle={group.title}
          language={language}
          gateways={gateways}
          extras={{ seats: topUp.seats }}
          summary={
            <ClassPurchaseSummary
              group={group}
              seats={topUp.seats}
              seatPrice={topUp.seat_price}
              format={fmt}
            />
          }
          hold={hold}
          onPay={(couponCode, provider, useCredit) =>
            purchase({ tutoring_group_id: group.id }, topUp.seats * topUp.seat_price, group.id, {
              seats: topUp.seats,
              provider,
              couponCode,
              useCredit,
            })
          }
          onClose={() => {
            reset();
            setTopUp(null);
            onMoved();
          }}
        />
      ) : null}
    </div>
  );
}
