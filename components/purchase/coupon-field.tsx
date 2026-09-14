'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface CouponFieldProps {
  code: string;
  onCodeChange: (code: string) => void;
  onApply: () => void;
  loading: boolean;
  accepted: boolean;
  rejected: boolean;
}

/** Discount code input with the verdict of the last priced code. */
export function CouponField({
  code,
  onCodeChange,
  onApply,
  loading,
  accepted,
  rejected,
}: CouponFieldProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center gap-2">
        <input
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder={t('checkout.discountCode')}
          className={cn(
            'placeholder:text-muted h-11 min-w-0 flex-1 rounded-xl border bg-transparent px-3 text-sm text-(--theme-foreground) outline-none focus:border-(--theme-primary)',
            accepted ? 'border-emerald-500' : rejected ? 'border-red-500' : 'border-theme',
          )}
        />
        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="border-theme flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-4 text-xs font-bold text-(--theme-foreground) disabled:opacity-60"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {t('checkout.applyDiscount')}
        </button>
      </div>
      {accepted && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t('checkout.couponApplied')}
        </p>
      )}
      {rejected && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {t('checkout.couponInvalid')}
        </p>
      )}
    </>
  );
}
