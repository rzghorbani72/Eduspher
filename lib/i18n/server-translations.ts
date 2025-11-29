/**
 * Server-side translation helper
 * For use in server components and server actions
 */

import "server-only";

import { t as clientT, getTranslations } from "./index";
import { getSchoolLanguage } from "./server";
import type { LanguageCode } from "./config";

/**
 * Get translation function for server components
 * Requires school language to be passed or determined
 */
export async function getServerTranslation(language?: LanguageCode) {
  // If language is provided, use it
  // Otherwise, we'd need to fetch school data here
  // For now, we'll use the language parameter
  const lang = language || 'en';
  
  return {
    t: (key: string) => clientT(key, lang),
    translations: getTranslations(lang),
    language: lang,
  };
}

/**
 * Simple translation function for server components
 * Use this when you already have the language
 */
export function t(key: string, language: LanguageCode = 'en'): string {
  return clientT(key, language);
}

