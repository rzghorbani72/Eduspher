'use client';

import { useCallback, useMemo } from 'react';

import { useI18n } from '@/lib/i18n/provider';
import {
  formatLtrValue,
  formatNumber,
  formatPercent,
  formatPhoneDisplay,
  toPersianDigits,
} from '@/lib/utils';

/**
 * Numbers are stored and sent to the API in English digits; only what the user
 * reads is localised. Every auth screen formats through this so a Persian page
 * never shows a mixed "۰۹۱۲ 3456" number.
 */
export function useLocaleDigits() {
  const { language } = useI18n();
  return useCallback((value: string | number) => toPersianDigits(value, language), [language]);
}

/**
 * The same localisation for the shapes a number takes on screen. Client
 * components use this so a count, a percentage and a phone number are formatted
 * exactly the way the server-rendered pages format them.
 */
export function useLocaleFormat() {
  const { language } = useI18n();
  return useMemo(
    () => ({
      language,
      digits: (value: string | number) => toPersianDigits(value, language),
      number: (value: number) => formatNumber(value, language),
      percent: (value: number) => formatPercent(value, language),
      ltr: (value: string) => formatLtrValue(value, language),
      phone: (value: string) => formatPhoneDisplay(value, language),
    }),
    [language],
  );
}
