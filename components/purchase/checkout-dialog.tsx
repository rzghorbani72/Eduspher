'use client';

import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Lock, X } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatCurrencyWithAcademy, toPersianDigits } from '@/lib/utils';
import { useCheckoutQuote } from '@/components/purchase/use-checkout-quote';
import { useDialogAction } from '@/hooks/use-dialog-action';
import type {
  PurchaseGateway,
  PurchaseOutcome,
  PurchaseSelector,
} from '@/components/purchase/use-purchase';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { CouponField } from '@/components/purchase/coupon-field';
import { CheckoutPriceRows } from '@/components/purchase/checkout-price-rows';
import { GatewayButtons } from '@/components/purchase/gateway-buttons';
import { HoldCountdown } from '@/components/purchase/hold-countdown';
import type { SeatHoldState } from '@/components/purchase/use-seat-hold';

interface CheckoutDialogProps {
  selector: PurchaseSelector;
  /** Shown until the server quote arrives. */
  fallbackAmount: number;
  fallbackTitle: string | null;
  /** Falls back to the academy-less format when the surface has no config. */
  currencyConfig?: CurrencyConfig | null;
  language?: string;
  /** Non-empty when the buyer must choose which bank to pay through. */
  gateways: PurchaseGateway[];
  onPay: (
    couponCode: string | undefined,
    provider: string | undefined,
    useCredit: boolean,
  ) => Promise<PurchaseOutcome | void>;
  onClose: () => void;
  /** Extra pricing inputs the selector cannot carry, e.g. group class seats. */
  extras?: Record<string, string | number>;
  /** What exactly is being bought, in the buyer's words (class, times, seats). */
  summary?: ReactNode;
  /** Seats held while this dialog is open. */
  hold?: SeatHoldState;
}

/**
 * The last step before the bank: what is being bought, what a coupon takes off,
 * the total (listed price − coupon + VAT) and one Pay button — so nobody is
 * redirected to a gateway without seeing the exact amount first.
 */
export function CheckoutDialog({
  selector,
  fallbackAmount,
  fallbackTitle,
  currencyConfig = null,
  language: languageProp,
  gateways,
  onPay,
  onClose,
  extras,
  summary,
  hold,
}: CheckoutDialogProps) {
  const { t, language: uiLanguage } = useTranslation();
  const language = languageProp ?? uiLanguage;
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<string | undefined>(undefined);
  const [useCredit, setUseCredit] = useState(true);
  const [payingProvider, setPayingProvider] = useState<string | null>(null);
  const { quote, loading, reprice } = useCheckoutQuote(selector, true, {
    ...extras,
    ...(useCredit ? {} : { use_credit: 'false' }),
  });
  const blocked = Boolean(hold?.expired || hold?.full);
  const { pending: busy, run } = useDialogAction(onClose, t('checkout.paymentFailed'));

  /** A gateway list is not an outcome, so only a real result closes the dialog. */
  const pay = (couponCode: string | undefined, provider?: string) =>
    void run(async () => {
      const outcome = await onPay(couponCode, provider, useCredit);
      return { keepOpen: Boolean(outcome && outcome.needsGateway) };
    });

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  const applyCode = async () => {
    const trimmed = code.trim();
    setApplied(trimmed || undefined);
    await reprice(trimmed || undefined);
  };

  /** Feedback belongs to the code that was actually priced, not to new typing. */
  const codeIsPriced = applied !== undefined && code.trim() === applied && !loading;
  const couponAccepted = codeIsPriced && Boolean(quote?.coupon_applied);
  const couponRejected = codeIsPriced && Boolean(quote?.coupon_invalid);

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="border-theme bg-card w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
        <div className="border-theme flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2
              id="checkout-dialog-title"
              className="text-base font-black text-(--theme-foreground)"
            >
              {t('checkout.confirmTitle')}
            </h2>
            <p className="text-muted mt-0.5 text-xs">
              {quote?.title ?? fallbackTitle ?? t('checkout.confirmHint')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.cancel')}
            className="text-muted rounded-full p-1 hover:text-(--theme-foreground)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 text-sm">
          {summary}
          {hold ? (
            <HoldCountdown
              expiresAt={hold.expiresAt}
              expired={hold.expired}
              onExpired={hold.markExpired}
              onRenew={hold.renew}
            />
          ) : null}
          {hold?.full ? (
            <p role="alert" className="text-xs text-red-600">
              {t('courses.groupFull')}
            </p>
          ) : null}
          <CouponField
            code={code}
            onCodeChange={setCode}
            onApply={() => void applyCode()}
            loading={loading}
            accepted={couponAccepted}
            rejected={couponRejected}
          />
          <CheckoutPriceRows
            quote={quote}
            fallbackAmount={fallbackAmount}
            loading={loading}
            useCredit={useCredit}
            onUseCreditChange={setUseCredit}
            fmt={fmt}
          />

          {gateways.length > 0 && (
            <GatewayButtons
              gateways={gateways}
              busy={busy}
              disabled={blocked}
              payingProvider={payingProvider}
              onPick={(provider) => {
                setPayingProvider(provider);
                pay(couponAccepted ? applied : undefined, provider);
              }}
            />
          )}
        </div>

        <div className="space-y-2 px-5 pb-5">
          {gateways.length === 0 && (
            <button
              type="button"
              disabled={busy || loading || blocked}
              onClick={() => pay(couponAccepted ? applied : undefined)}
              className={cn(
                'cd-cta-btn flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold text-white',
                busy || loading || blocked
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:-translate-y-0.5',
              )}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('checkout.payNow')}
            </button>
          )}
          <p className="text-muted flex items-center justify-center gap-1.5 text-[11px]">
            <Lock className="h-3 w-3" />
            {t('courses.securePaymentNote')}
          </p>
        </div>
      </div>
    </div>
  );

  return typeof document === 'undefined' ? dialog : createPortal(dialog, document.body);
}
