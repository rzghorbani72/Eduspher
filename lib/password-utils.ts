import { toEnglishDigits } from "@/lib/phone-utils";

/** Printable ASCII (English letters, digits, symbols). */
const NON_ASCII_PRINTABLE = /[^\x20-\x7E]/g;

/**
 * Convert Persian/Arabic digits to English and drop any non-English character
 * so the password field never accepts Persian letters or other scripts.
 * Mirrors AdminPanel's rule, so one password behaves the same in both apps.
 */
export function sanitizePasswordInput(value: string): string {
  return toEnglishDigits(value).replace(NON_ASCII_PRINTABLE, "");
}
