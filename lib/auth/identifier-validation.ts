import { type CountryCode } from "@/lib/country-codes";
import { cleanPhoneNumber, isValidPhoneNumber } from "@/lib/phone-utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean =>
  EMAIL_PATTERN.test(email.trim());

/**
 * A typed phone is judged only once it is long enough to be a whole number, so
 * a half-typed number is never reported as wrong while the user is still typing.
 */
export const isValidPhoneInput = (
  phoneNumber: string,
  country: CountryCode,
): boolean =>
  isValidPhoneNumber(cleanPhoneNumber(phoneNumber, country), country);
