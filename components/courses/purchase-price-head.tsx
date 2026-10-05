'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';
import type { PurchaseOptionView } from '@/lib/courses/purchase-options';
import { KIND_DESC, KIND_TITLE } from '@/components/courses/purchase-option-row';

interface PurchasePriceHeadProps {
  option: PurchaseOptionView;
  format: (amount: number) => string;
}

export function PurchasePriceHead({ option, format }: PurchasePriceHeadProps) {
  const { t, language } = useTranslation();
  const isFree = option.kind === 'FREE' || option.price <= 0;
  const subtitle = [
    option.title || t(KIND_TITLE[option.kind]),
    option.description || t(KIND_DESC[option.kind]),
  ].join(' · ');

  return (
    <div className="cd-price-head px-6 pt-5 pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="cd-price-chip rounded-full px-3 py-0.5 text-xs font-bold">
          {t('courses.enrollThisCourse')}
        </span>
        {option.discountPercent ? (
          <span className="cd-price rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-(--theme-primary)">
            {toPersianDigits(option.discountPercent, language)}%
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="cd-price text-[40px] leading-tight font-black tracking-tight">
          {isFree ? t('courses.free') : format(option.price)}
        </span>
        {option.installments ? (
          <span className="text-sm font-semibold opacity-85">{t('courses.perInstallment')}</span>
        ) : null}
        {option.originalPrice ? (
          <span className="cd-price text-sm font-semibold line-through opacity-70">
            {format(option.originalPrice)}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[13px] opacity-85">{subtitle}</p>
    </div>
  );
}
