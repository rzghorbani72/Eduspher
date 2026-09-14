'use client';

import { useMemo } from 'react';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import persian_fa from 'react-date-object/locales/persian_fa';
import DatePickerBase from 'react-multi-date-picker';
import TimePickerPlugin from 'react-multi-date-picker/plugins/time_picker';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  id?: string;
  /** `HH:mm` on a 24-hour clock. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const TIME_ANCHOR = new Date(2024, 0, 1);

/** 24-hour clock with Persian digits; the native time input follows the browser locale (AM/PM). */
export function TimePicker({
  id,
  value,
  onChange,
  disabled,
  className,
  'aria-label': ariaLabel,
}: TimePickerProps) {
  const { language } = useTranslation();
  const isPersian = language === 'fa';

  const selected = useMemo(() => {
    const [hours, minutes] = (value || '00:00').split(':').map(Number);
    const date = new Date(TIME_ANCHOR);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }, [value]);

  return (
    <DatePickerBase
      id={id}
      value={selected}
      onChange={(picked) => {
        if (!picked || Array.isArray(picked)) return;
        const date = picked.toDate();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        onChange(`${hh}:${mm}`);
      }}
      calendar={isPersian ? persian : gregorian}
      locale={isPersian ? persian_fa : gregorian_en}
      calendarPosition={isPersian ? 'bottom-right' : 'bottom-left'}
      disableDayPicker
      format="HH:mm"
      plugins={[<TimePickerPlugin key="time" hideSeconds />]}
      disabled={disabled}
      inputClass={cn(
        'flex h-11 w-full cursor-pointer rounded-xl border border-(--theme-border-color) bg-(--theme-surface) px-4 text-center text-sm font-semibold text-(--theme-foreground) transition-colors',
        'focus-visible:border-(--theme-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary)/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      containerClassName={cn('w-full', className)}
      editable={false}
      aria-label={ariaLabel}
    />
  );
}
