/**
 * React hooks for i18n
 */

'use client';

import { useCallback, useMemo } from 'react';

import { useI18n } from './provider';
import { t as translate, getTranslations } from './index';

/**
 * Hook to get translation function. `t` is stable for a given language so
 * effects that only need the translator do not re-fire every render.
 */
export function useTranslation() {
  const { language } = useI18n();

  const t = useCallback((key: string) => translate(key, language), [language]);
  const translations = useMemo(() => getTranslations(language), [language]);

  return useMemo(() => ({ t, language, translations }), [t, language, translations]);
}

/**
 * Hook to get language and direction info
 */
export function useLanguage() {
  const { language, direction, isRTL, config } = useI18n();

  return useMemo(
    () => ({
      language,
      direction,
      isRTL,
      config,
    }),
    [language, direction, isRTL, config],
  );
}
