"use client";

import { createContext, useContext, ReactNode } from "react";
import type { LanguageCode, TextDirection, LanguageConfig } from "./config";
import { getLanguageConfig, getDefaultLanguageForCountry, isRTL, getTextDirection } from "./config";

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

export function I18nProvider({
  children,
  initialLanguage,
  countryCode,
}: I18nProviderProps) {
  // Determine initial language
  const defaultLanguage = initialLanguage || 
    (countryCode ? getDefaultLanguageForCountry(countryCode) : 'en');
  
  const config = getLanguageConfig(defaultLanguage);
  const direction = config.direction;
  const rtl = isRTL(defaultLanguage);

  // For now, language is static based on store/country
  // In the future, we can add language switching functionality
  const setLanguage = (language: LanguageCode) => {
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', language);
    }
    // Reload page to apply new language
    window.location.reload();
  };

  return (
    <I18nContext.Provider
      value={{
        language: defaultLanguage,
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
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

