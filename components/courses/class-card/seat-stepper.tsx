'use client';

import { Minus, Plus } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';

type Props = {
  value: number;
  max: number;
  onChange: (seats: number) => void;
};

const STEP_BUTTON =
  'grid size-8 place-items-center rounded-full border border-(--theme-border-color) bg-(--theme-background) text-(--theme-foreground) disabled:opacity-40';

export function SeatStepper({ value, max, onChange }: Props) {
  const { t, language } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('courses.groupReserveWhole')}
      className="flex items-center gap-2.5"
    >
      <button
        type="button"
        aria-label={t('courses.seatsIncrease')}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={STEP_BUTTON}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
      <b className="cd-price min-w-5 text-center text-sm">{formatNumber(value, language)}</b>
      <button
        type="button"
        aria-label={t('courses.seatsDecrease')}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={STEP_BUTTON}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
