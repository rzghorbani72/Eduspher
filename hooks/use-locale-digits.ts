"use client";

import { useCallback } from "react";

import { useI18n } from "@/lib/i18n/provider";
import { toPersianDigits } from "@/lib/utils";

/**
 * Numbers are stored and sent to the API in English digits; only what the user
 * reads is localised. Every auth screen formats through this so a Persian page
 * never shows a mixed "۰۹۱۲ 3456" number.
 */
export function useLocaleDigits() {
  const { language } = useI18n();
  return useCallback(
    (value: string | number) => toPersianDigits(value, language),
    [language],
  );
}
