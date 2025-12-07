/**
 * Server-side i18n utilities
 * Used in server components to determine language and direction
 */

import "server-only";

import { getDefaultLanguageForCountry, getLanguageConfig, isRTL, getTextDirection } from "./config";
import type { LanguageCode, TextDirection } from "./config";

/**
 * Get language configuration for a store
 * Determines language from store config or falls back to country default
 */
export function getStoreLanguage(
  storeLanguage?: string | null,
  countryCode?: string | null
): LanguageCode {
  // If store has explicit language, use it
  if (storeLanguage) {
    const validLanguage = storeLanguage.toLowerCase() as LanguageCode;
    // Validate it's a supported language
    const supportedLanguages: LanguageCode[] = ['en', 'fa', 'ar', 'tr', 'de', 'fr', 'es', 'it', 'ru', 'zh', 'ja', 'ko', 'hi', 'ur', 'he'];
    if (supportedLanguages.includes(validLanguage)) {
      return validLanguage;
    }
  }
  
  // Fall back to country default
  if (countryCode) {
    return getDefaultLanguageForCountry(countryCode);
  }
  
  // Default to English
  return 'en';
}

/**
 * Get text direction for a store
 */
export function getStoreDirection(
  storeLanguage?: string | null,
  countryCode?: string | null
): TextDirection {
  const language = getStoreLanguage(storeLanguage, countryCode);
  return getTextDirection(language);
}

/**
 * Check if store uses RTL
 */
export function isStoreRTL(
  storeLanguage?: string | null,
  countryCode?: string | null
): boolean {
  const language = getStoreLanguage(storeLanguage, countryCode);
  return isRTL(language);
}

/**
 * Get full language configuration for a store
 */
export function getStoreLanguageConfig(
  storeLanguage?: string | null,
  countryCode?: string | null
) {
  const language = getStoreLanguage(storeLanguage, countryCode);
  return getLanguageConfig(language);
}

