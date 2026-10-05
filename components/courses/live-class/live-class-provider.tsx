'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useEnrollmentClosed } from '@/components/academy/enrollment-status-provider';
import { ClassPurchaseSummary } from '@/components/courses/class-purchase-summary';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { QuickEnrollDialog } from '@/components/courses/quick-enroll/quick-enroll-dialog';
import { CheckoutDialog } from '@/components/purchase/checkout-dialog';
import { usePurchase } from '@/components/purchase/use-purchase';
import { useSeatHold } from '@/components/purchase/use-seat-hold';
import type { PublicTutoringGroup } from '@/lib/api/server';
import {
  canBuyMoreSeats,
  enrollHref,
  groupAnchorId,
  pickDefaultClass,
  seatPriceOfGroup,
} from '@/lib/courses/live-course';
import { formatCurrencyWithAcademy } from '@/lib/utils';

type LiveClassContextValue = {
  groups: readonly PublicTutoringGroup[];
  selected: PublicTutoringGroup | null;
  select: (groupId: string) => void;
  seats: number;
  setSeats: (seats: number) => void;
  /** Starts enrolling in the selected class: sign-in dialog for guests, checkout otherwise. */
  enroll: () => void;
  pending: boolean;
  error: string | null;
  format: (amount: number) => string;
  isLoggedIn: boolean;
  isStaff: boolean;
  /** The academy sells seats and the viewer may buy one. */
  canPurchase: boolean;
  enrollmentClosed: boolean;
  /** The viewer holds the course. Never opens a class: each class needs its own seat. */
  hasAccess: boolean;
  liveClassHref: string;
};

const LiveClassContext = createContext<LiveClassContextValue | null>(null);

export function useLiveClass(): LiveClassContextValue {
  const value = useContext(LiveClassContext);
  if (!value) throw new Error('useLiveClass must be used inside LiveClassProvider');
  return value;
}

interface LiveClassProviderProps {
  groups: readonly PublicTutoringGroup[];
  currencyConfig: CurrencyConfig | null;
  language: string;
  loginHref: string;
  isLoggedIn: boolean;
  isStaff?: boolean;
  hasAccess?: boolean;
  liveClassHref: string;
  /** Present only for a private class opened through its share link. */
  joinCode?: string;
  children: ReactNode;
}

/**
 * One selected class for the whole page: the class list picks it, and the
 * sidebar / mobile bar act on it. Checkout and sign-in dialogs live here once.
 */
export function LiveClassProvider({
  groups,
  currencyConfig,
  language,
  loginHref,
  isLoggedIn,
  isStaff = false,
  hasAccess = false,
  liveClassHref,
  joinCode,
  children,
}: LiveClassProviderProps) {
  const closed = useEnrollmentClosed();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({ loginHref });
  const [selectedId, setSelectedId] = useState(() => pickDefaultClass(groups)?.id ?? null);
  const [seatsByGroup, setSeatsByGroup] = useState<Record<string, number>>({});
  const [confirming, setConfirming] = useState<PublicTutoringGroup | null>(null);
  const [authFor, setAuthFor] = useState<PublicTutoringGroup | null>(null);
  const pathname = usePathname();
  const resumeClassId = useSearchParams().get('class');

  const selected = groups.find((group) => group.id === selectedId) ?? null;
  const seatsFor = (group: PublicTutoringGroup) => seatsByGroup[group.id] ?? 1;
  const canPurchase = !closed && !isStaff;

  const start = (group: PublicTutoringGroup) => {
    if (!canPurchase || !canBuyMoreSeats(group)) return;
    (isLoggedIn ? setConfirming : setAuthFor)(group);
  };

  // `?class=<id>` resumes enrolling after the sign-in dialog reloads the page.
  useEffect(() => {
    if (!resumeClassId) return;
    const picked = groups.find((group) => group.id === resumeClassId);
    if (picked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the URL once
      setSelectedId(picked.id);
      if (!isStaff && !closed && canBuyMoreSeats(picked)) {
        (isLoggedIn ? setConfirming : setAuthFor)(picked);
      }
    }
    window.history.replaceState(null, '', `${pathname}#${groupAnchorId(resumeClassId)}`);
  }, [isLoggedIn, isStaff, closed, resumeClassId, groups, pathname]);

  const hold = useSeatHold({
    groupId: confirming?.id ?? null,
    seats: confirming ? seatsFor(confirming) : 1,
    joinCode,
    enabled: Boolean(confirming),
  });

  const format = (amount: number) => formatCurrencyWithAcademy(amount, currencyConfig, 1, language);

  const value: LiveClassContextValue = {
    groups,
    selected,
    select: setSelectedId,
    seats: selected ? seatsFor(selected) : 1,
    setSeats: (seats) => {
      if (selected) setSeatsByGroup((prev) => ({ ...prev, [selected.id]: seats }));
    },
    enroll: () => {
      if (selected) start(selected);
    },
    pending: Boolean(selected && pendingKey === selected.id),
    error,
    format,
    isLoggedIn,
    isStaff,
    canPurchase,
    enrollmentClosed: closed && !isStaff,
    hasAccess,
    liveClassHref,
  };

  return (
    <LiveClassContext.Provider value={value}>
      {children}

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
            purchase(
              { tutoring_group_id: confirming.id },
              seatPriceOfGroup(confirming) * seatsFor(confirming),
              confirming.id,
              { seats: seatsFor(confirming), joinCode, provider, couponCode, useCredit },
            )
          }
          onClose={() => {
            reset();
            setConfirming(null);
          }}
        />
      ) : null}
    </LiveClassContext.Provider>
  );
}
