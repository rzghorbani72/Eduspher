/**
 * Server-side i18n utilities
 * Used in server components to determine language and direction
 */

import "server-only";

import { DEFAULT_LANGUAGE, getDefaultLanguageForCountry, getLanguageConfig, isRTL, getTextDirection } from "./config";
import type { LanguageCode, TextDirection } from "./config";

/**
 * Resolve UI language from academy settings or country default.
 */
export function getAcademyLanguage(
  academyLanguage?: string | null,
  countryCode?: string | null
): LanguageCode {
  if (academyLanguage) {
    const validLanguage = academyLanguage.toLowerCase() as LanguageCode;
    const supportedLanguages: LanguageCode[] = ['en', 'fa', 'ar', 'tr', 'de', 'fr', 'es', 'it', 'ru', 'zh', 'ja', 'ko', 'hi', 'ur', 'he'];
    if (supportedLanguages.includes(validLanguage)) {
      return validLanguage;
    }
  }

  if (countryCode) {
    return getDefaultLanguageForCountry(countryCode);
  }

  // Deployment-level locale (set via NEXT_PUBLIC_DEFAULT_LOCALE)
  const deployLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  if (deployLocale) {
    const lang = deployLocale.toLowerCase() as LanguageCode;
    const config = getLanguageConfig(lang);
    if (config.code === lang) return lang;
  }

  return DEFAULT_LANGUAGE;
}

export function getAcademyDirection(
  academyLanguage?: string | null,
  countryCode?: string | null
): TextDirection {
  const language = getAcademyLanguage(academyLanguage, countryCode);
  return getTextDirection(language);
}

export function isAcademyRTL(
  academyLanguage?: string | null,
  countryCode?: string | null
): boolean {
  const language = getAcademyLanguage(academyLanguage, countryCode);
  return isRTL(language);
}

export function getAcademyLanguageConfig(
  academyLanguage?: string | null,
  countryCode?: string | null
) {
  const language = getAcademyLanguage(academyLanguage, countryCode);
  return getLanguageConfig(language);
}

