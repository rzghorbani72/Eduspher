'use client';

import { useMemo } from 'react';
import DatePickerBase from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import persian_fa from 'react-date-object/locales/persian_fa';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type PickedDate = { toDate: () => Date };

interface DatePickerProps {
  id?: string;
  /** Gregorian `YYYY-MM-DD`. Empty means unset. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  'aria-label'?: string;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromYmd(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Day picker — Jalali + Persian digits when language is `fa`, Gregorian otherwise.
 * Stored value is always Gregorian `YYYY-MM-DD` for the API.
 */
export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  className,
  minDate,
  maxDate,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const { language } = useTranslation();
  const isPersian = language === 'fa';

  const selected = useMemo(() => fromYmd(value), [value]);

  return (
    <DatePickerBase
      id={id}
      value={selected}
      onChange={(picked) => {
        if (!picked || Array.isArray(picked)) {
          onChange('');
          return;
        }
        onChange(toYmd((picked as PickedDate).toDate()));
      }}
      calendar={isPersian ? persian : gregorian}
      locale={isPersian ? persian_fa : gregorian_en}
      calendarPosition={isPersian ? 'bottom-right' : 'bottom-left'}
      format="YYYY/MM/DD"
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      placeholder={placeholder}
      portal
      inputClass={cn(
        'h-11 w-full max-w-full cursor-pointer rounded-xl border border-(--theme-foreground)/10',
        'bg-(--theme-background)/70 px-3.5 text-sm text-(--theme-foreground)',
        'transition-colors focus-visible:border-(--theme-primary) focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--theme-primary)/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
      )}
      containerClassName={cn('w-full max-w-full min-w-0', className)}
      editable={false}
      aria-label={ariaLabel}
    />
  );
}
