/**
 * Server-side i18n utilities
 * Used in server components to determine language and direction
 */

import "server-only";

import { getDefaultLanguageForCountry, getLanguageConfig, isRTL, getTextDirection } from "./config";
import type { LanguageCode, TextDirection } from "./config";

/**
 * Get language configuration for a school
 * Determines language from school config or falls back to country default
 */
export function getSchoolLanguage(
  schoolLanguage?: string | null,
  countryCode?: string | null
): LanguageCode {
  // If school has explicit language, use it
  if (schoolLanguage) {
    const validLanguage = schoolLanguage.toLowerCase() as LanguageCode;
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
 * Get text direction for a school
 */
export function getSchoolDirection(
  schoolLanguage?: string | null,
  countryCode?: string | null
): TextDirection {
  const language = getSchoolLanguage(schoolLanguage, countryCode);
  return getTextDirection(language);
}

/**
 * Check if school uses RTL
 */
export function isSchoolRTL(
  schoolLanguage?: string | null,
  countryCode?: string | null
): boolean {
  const language = getSchoolLanguage(schoolLanguage, countryCode);
  return isRTL(language);
}

/**
 * Get full language configuration for a school
 */
export function getSchoolLanguageConfig(
  schoolLanguage?: string | null,
  countryCode?: string | null
) {
  const language = getSchoolLanguage(schoolLanguage, countryCode);
  return getLanguageConfig(language);
}

