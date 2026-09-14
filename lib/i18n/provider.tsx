'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LanguageCode, TextDirection, LanguageConfig } from './config';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  getLanguageConfig,
  getDefaultLanguageForCountry,
  isRTL,
} from './config';

const PREFERRED_LANGUAGE_KEY = 'preferred_language';

function readSavedLanguage(): LanguageCode | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(PREFERRED_LANGUAGE_KEY);
  return saved && saved in LANGUAGES ? (saved as LanguageCode) : null;
}

interface I18nContextValue {
  language: LanguageCode;
  direction: TextDirection;
  config: LanguageConfig;
  setLanguage: (language: LanguageCode) => void;
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
  const resolved = resolveLanguage(initialLanguage, countryCode);
  const [language, setLanguageState] = useState<LanguageCode>(resolved);

  // Apply the user's saved choice after mount so it survives reloads and
  // overrides the server-resolved default. Done in an effect to keep the
  // first client render identical to the server HTML (no hydration mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable post-mount; the server-resolved value must render first to avoid a hydration mismatch.
    setLanguageState(readSavedLanguage() ?? resolveLanguage(initialLanguage, countryCode));
  }, [initialLanguage, countryCode]);

  const config = useMemo(() => getLanguageConfig(language), [language]);
  const direction = config.direction;
  const rtl = isRTL(language);

  const setLanguage = (next: LanguageCode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFERRED_LANGUAGE_KEY, next);
    }
    setLanguageState(next);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        direction,
        config,
        setLanguage,
        isRTL: rtl,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
