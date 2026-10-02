'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { LanguageCode, TextDirection, LanguageConfig } from './config';
import { DEFAULT_LANGUAGE, getLanguageConfig, getDefaultLanguageForCountry, isRTL } from './config';

const PREFERRED_LANGUAGE_KEY = 'preferred_language';

interface I18nContextValue {
  language: LanguageCode;
  direction: TextDirection;
  config: LanguageConfig;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: LanguageCode;
  countryCode?: string | null;
}

function resolveLanguage(
  initialLanguage?: LanguageCode,
  countryCode?: string | null,
): LanguageCode {
  if (initialLanguage) return initialLanguage;
  if (countryCode) return getDefaultLanguageForCountry(countryCode);
  return DEFAULT_LANGUAGE;
}

export function I18nProvider({ children, initialLanguage, countryCode }: I18nProviderProps) {
  const language = resolveLanguage(initialLanguage, countryCode);

  // Language switching is off for now; drop an old saved choice so API calls use the same language.
  useEffect(() => {
    localStorage.removeItem(PREFERRED_LANGUAGE_KEY);
  }, []);

  const config = useMemo(() => getLanguageConfig(language), [language]);
  const direction = config.direction;
  const rtl = isRTL(language);

  const value = useMemo(
    () => ({
      language,
      direction,
      config,
      isRTL: rtl,
    }),
    [language, direction, config, rtl],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/** Safe when a caller may render outside the provider (toasts, preview chrome). */
export function useI18nOptional() {
  return useContext(I18nContext);
}
