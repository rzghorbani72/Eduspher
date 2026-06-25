"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LanguageCode, TextDirection, LanguageConfig } from "./config";
import { DEFAULT_LANGUAGE, getLanguageConfig, getDefaultLanguageForCountry, isRTL } from "./config";

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
  countryCode?: string | null
): LanguageCode {
  if (initialLanguage) return initialLanguage;
  if (countryCode) return getDefaultLanguageForCountry(countryCode);
  return DEFAULT_LANGUAGE;
}

export function I18nProvider({
  children,
  initialLanguage,
  countryCode,
}: I18nProviderProps) {
  const resolved = resolveLanguage(initialLanguage, countryCode);
  const [language, setLanguageState] = useState<LanguageCode>(resolved);

  useEffect(() => {
    setLanguageState(resolveLanguage(initialLanguage, countryCode));
  }, [initialLanguage, countryCode]);

  const config = useMemo(() => getLanguageConfig(language), [language]);
  const direction = config.direction;
  const rtl = isRTL(language);

  const setLanguage = (next: LanguageCode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", next);
    }
    window.location.reload();
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
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

