/**
 * Internationalization (i18n) utilities
 * Provides translation functions and language management
 */

import { DEFAULT_LANGUAGE, type LanguageCode } from './config';
import { getLanguageConfig, getDefaultLanguageForCountry, isRTL, getTextDirection } from './config';
import { en } from './translations/en';
import { fa } from './translations/fa';
import { ar } from './translations/ar';
import { tr } from './translations/tr';

// Import all translations
const translations = {
  en,
  fa,
  ar,
  tr,
} as const;

export type TranslationKey = keyof typeof en;

/**
 * Get translation for a key
 */
export function t(key: string, language: LanguageCode = DEFAULT_LANGUAGE): string {
  const keys = key.split('.');
  const bundles = translations as unknown as Record<string, typeof en>;
  let value: unknown = bundles[language] ?? translations.en;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      // Fallback to English if the key is missing from this bundle.
      let fallback: unknown = translations.en;
      for (const fallbackKey of keys) {
        if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
          fallback = fallback[fallbackKey as keyof typeof fallback];
        } else {
          return key; // Return key if translation not found
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(language: LanguageCode = DEFAULT_LANGUAGE) {
  const bundles = translations as unknown as Record<string, typeof en>;
  return bundles[language] ?? translations.en;
}

/**
 * Get language from store country code
 */
export function getLanguageFromCountry(countryCode: string | null | undefined): LanguageCode {
  if (!countryCode) return DEFAULT_LANGUAGE;
  return getDefaultLanguageForCountry(countryCode);
}

/**
 * Get language configuration
 */
export { getLanguageConfig, getDefaultLanguageForCountry, isRTL, getTextDirection };

/**
 * Re-export types
 */
export type { LanguageCode, TextDirection, LanguageConfig } from './config';
export { DEFAULT_LANGUAGE } from './config';

