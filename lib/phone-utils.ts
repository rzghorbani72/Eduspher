import { CountryCode } from './country-codes';

export function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48));
}

export interface PhoneLengthRule {
  min: number;
  max: number;
}

export const DEFAULT_PHONE_LENGTH: PhoneLengthRule = { min: 7, max: 15 };

export const PHONE_LENGTH_RULES: Record<string, PhoneLengthRule> = {
  US: { min: 10, max: 10 },
  CA: { min: 10, max: 10 },
  GB: { min: 10, max: 11 },
  AU: { min: 9, max: 10 },
  DE: { min: 10, max: 12 },
  FR: { min: 9, max: 10 },
  IT: { min: 9, max: 10 },
  ES: { min: 9, max: 9 },
  IN: { min: 10, max: 10 },
  CN: { min: 11, max: 11 },
  JP: { min: 10, max: 11 },
  KR: { min: 10, max: 11 },
  BR: { min: 10, max: 11 },
  MX: { min: 10, max: 10 },
  RU: { min: 10, max: 10 },
  IR: { min: 10, max: 10 },
  PK: { min: 10, max: 10 },
  BD: { min: 10, max: 10 },
  TH: { min: 9, max: 10 },
  VN: { min: 9, max: 10 },
  ID: { min: 9, max: 12 },
  MY: { min: 9, max: 10 },
  SG: { min: 8, max: 8 },
  PH: { min: 10, max: 10 },
  TW: { min: 9, max: 10 },
  HK: { min: 8, max: 8 },
  NZ: { min: 8, max: 9 },
  ZA: { min: 9, max: 9 },
  EG: { min: 10, max: 10 },
  NG: { min: 10, max: 11 },
  KE: { min: 9, max: 10 },
  MA: { min: 9, max: 10 },
  TN: { min: 8, max: 8 },
  DZ: { min: 9, max: 9 },
  SA: { min: 9, max: 9 },
  AE: { min: 9, max: 9 },
  IL: { min: 9, max: 10 },
  LK: { min: 9, max: 9 },
};

export const getPhoneLengthRule = (countryCode: CountryCode): PhoneLengthRule =>
  PHONE_LENGTH_RULES[countryCode.code] ?? DEFAULT_PHONE_LENGTH;

export const cleanPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';

  let cleaned = toEnglishDigits(phoneNumber).replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith(countryCode.dialCode.replace('+', ''))) {
    cleaned = cleaned.substring(countryCode.dialCode.replace('+', '').length);
  }

  cleaned = cleaned.replace(/^0+/, '');
  cleaned = cleaned.replace(/\D/g, '');

  return cleaned;
};

export const isValidPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): boolean => {
  if (!phoneNumber) return false;

  const { min, max } = getPhoneLengthRule(countryCode);
  return /^\d+$/.test(phoneNumber) &&
    phoneNumber.length >= min &&
    phoneNumber.length <= max;
};

export const getFullPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';
  return `${countryCode.dialCode}${phoneNumber}`;
};


























