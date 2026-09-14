import { toEnglishDigits } from '@/lib/phone-utils';

/** Printable ASCII (English letters, digits, symbols). */
const NON_ASCII_PRINTABLE = /[^\x20-\x7E]/g;

/**
 * Convert Persian/Arabic digits to English and drop any non-English character
 * so the password field never accepts Persian letters or other scripts.
 * Mirrors AdminPanel's rule, so one password behaves the same in both apps.
 */
export function sanitizePasswordInput(value: string): string {
  return toEnglishDigits(value).replace(NON_ASCII_PRINTABLE, '');
}

export const MIN_PASSWORD_LENGTH = 6;

/** Printable ASCII that is neither a letter nor a digit, e.g. ! @ # $ % ? */
const SYMBOL = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;

export interface PasswordChecks {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  const normalized = toEnglishDigits(password);
  return {
    minLength: normalized.length >= MIN_PASSWORD_LENGTH,
    hasLetter: /[a-zA-Z]/.test(normalized),
    hasNumber: /[0-9]/.test(normalized),
    hasSymbol: SYMBOL.test(normalized),
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}
