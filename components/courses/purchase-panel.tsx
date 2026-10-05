'use client';

import { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';

import { useRequireLogin } from '@/components/courses/quick-enroll/login-dialog-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatCurrencyWithAcademy, toPersianDigits, cn } from '@/lib/utils';
import { useEnrollmentClosed } from '@/components/academy/enrollment-status-provider';
import { usePurchase } from '@/components/purchase/use-purchase';
import { CheckoutDialog } from '@/components/purchase/checkout-dialog';
import type { PurchaseOptionView } from '@/lib/courses/purchase-options';
import { totalOf } from '@/lib/courses/purchase-options';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { PurchaseOptionRow } from '@/components/courses/purchase-option-row';
import { PurchasePriceHead } from '@/components/courses/purchase-price-head';
import { PurchaseIncludes } from '@/components/courses/purchase-includes';
import { MyAccessPanel } from '@/components/courses/my-access-panel';
import type { CourseAccessRow } from '@/lib/api/account-types';
import type { CourseContentStats } from '@/lib/courses/curriculum';

export interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  country_code?: string;
  language?: string;
}

interface PurchasePanelProps {
  options: PurchaseOptionView[];
  language: string;
  currencyConfig: CurrencyConfig | null;
  loginHref: string;
  isLoggedIn: boolean;
  /** Set when the visitor already owns the course; buying is replaced by "continue". */
  continueHref: string | null;
  /** Where each owned way is entered. */
  learnHref: string;
  liveClassesHref: string;
  tutoringHref: string;
  /** How this student got in, and until when. Null if they have no access. */
  access: CourseAccessRow | null;
  stats: CourseContentStats;
  progressPercent: number | null;
  isCertificate: boolean;
}

const CTA_KEY: Record<string, string> = {
  FREE: 'courses.enrollFree',
  ONE_TIME: 'courses.ctaBuy',
  PAYMENT_PLAN: 'courses.ctaStartInstallments',
  SUBSCRIPTION: 'courses.ctaSubscribe',
  TUTORING: 'courses.ctaSubscribe',
  PRIVATE: 'courses.ctaRequestPrivate',
};

/**
 * The single buy box: every published way to pay for this course — one-off,
 * installments, content subscription, private tutoring — as one radio group
 * with one call to action, so the student makes one decision.
 */
export function PurchasePanel({
  options,
  language,
  currencyConfig,
  loginHref,
  isLoggedIn,
  continueHref,
  learnHref,
  liveClassesHref,
  tutoringHref,
  access,
  stats,
  progressPercent,
  isCertificate,
}: PurchasePanelProps) {
  const { t } = useTranslation();
  const enrollmentClosed = useEnrollmentClosed();
  const requireLogin = useRequireLogin();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({
    loginHref,
  });
  const [confirming, setConfirming] = useState(false);
  const ownedOptions = options.filter((option) => option.owned);
  const [selectedKey, setSelectedKey] = useState(options[0]?.key ?? '');

  const selected = options.find((option) => option.key === selectedKey) ?? options[0];

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  // A student who already holds this course — bought it, was granted it by a
  // teacher or manager, or reaches it through their student group — is a paid
  // student: they see how to keep going, never a price again.
  const hasAccess = ownedOptions.length > 0 || continueHref !== null || access !== null;

  if (hasAccess) {
    return (
      <div className="cd-side-card overflow-hidden rounded-2xl border">
        <MyAccessPanel
          access={access}
          owned={ownedOptions}
          learnHref={continueHref ?? learnHref}
          liveClassesHref={liveClassesHref}
          tutoringHref={tutoringHref}
          stats={stats}
          progressPercent={progressPercent}
          isCertificate={isCertificate}
        />
      </div>
    );
  }

  if (!selected) return null;

  const isBusy = pendingKey === selected.key;
  const disabled = isLoggedIn && (isBusy || enrollmentClosed);
  const ctaLabel = !isLoggedIn
    ? t('courses.enrollLogin')
    : enrollmentClosed
      ? t('academyStatus.enrollmentClosedShort')
      : isBusy
        ? t('common.loading')
        : t(CTA_KEY[selected.kind] ?? 'courses.ctaBuy');

  return (
    <div className="cd-side-card overflow-hidden rounded-[22px] border">
      <PurchasePriceHead option={selected} format={fmt} />

      <div className="space-y-5 px-6 pt-5 pb-6">
        {options.length > 1 ? (
          <div role="radiogroup" aria-label={t('courses.chooseEnrollMethod')} className="space-y-2">
            {options.map((option) => (
              <PurchaseOptionRow
                key={option.key}
                option={option}
                selected={option.key === selected.key}
                onSelect={() => setSelectedKey(option.key)}
                format={fmt}
              />
            ))}
          </div>
        ) : null}

        <PurchaseIncludes
          option={selected}
          stats={stats}
          isCertificate={isCertificate}
          format={fmt}
          installmentTotal={totalOf(selected)}
        />

        <div>
          {isLoggedIn ? <CreditBalanceNote className="mb-3" /> : null}
          <button
            type="button"
            disabled={disabled}
            title={enrollmentClosed ? t('academyStatus.enrollmentClosed') : undefined}
            onClick={() => (isLoggedIn ? setConfirming(true) : requireLogin())}
            className={cn(
              'cd-cta-btn group flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-base font-extrabold transition-all',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-0.5',
            )}
          >
            {ctaLabel}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
          </button>

          {error && (
            <p role="alert" className="mt-2.5 text-center text-xs text-red-600">
              {error}
            </p>
          )}

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-(--theme-muted)">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            {t('courses.securePaymentNote')}
          </p>
        </div>
      </div>

      {isLoggedIn && confirming && (
        <CheckoutDialog
          selector={selected.selector}
          fallbackAmount={selected.price}
          fallbackTitle={selected.title}
          currencyConfig={currencyConfig}
          language={language}
          gateways={gateways}
          onPay={(couponCode, provider) =>
            purchase(selected.selector, selected.price, selected.key, {
              couponCode,
              provider,
            })
          }
          onClose={() => {
            reset();
            setConfirming(false);
          }}
        />
      )}
    </div>
  );
}
