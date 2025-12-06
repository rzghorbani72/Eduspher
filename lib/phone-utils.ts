import { CountryCode } from './country-codes';

export const cleanPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';

  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

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

  if (phoneNumber.length < 7 || phoneNumber.length > 15) {
    return false;
  }

  const patterns: Record<string, RegExp> = {
    US: /^\d{10}$/,
    CA: /^\d{10}$/,
    GB: /^\d{10,11}$/,
    AU: /^\d{9,10}$/,
    DE: /^\d{10,12}$/,
    FR: /^\d{9,10}$/,
    IT: /^\d{9,10}$/,
    ES: /^\d{9}$/,
    IN: /^\d{10}$/,
    CN: /^\d{11}$/,
    JP: /^\d{10,11}$/,
    KR: /^\d{10,11}$/,
    BR: /^\d{10,11}$/,
    MX: /^\d{10}$/,
    RU: /^\d{10}$/,
    IR: /^\d{10}$/,
    PK: /^\d{10}$/,
    BD: /^\d{10}$/,
    TH: /^\d{9,10}$/,
    VN: /^\d{9,10}$/,
    ID: /^\d{9,12}$/,
    MY: /^\d{9,10}$/,
    SG: /^\d{8}$/,
    PH: /^\d{10}$/,
    TW: /^\d{9,10}$/,
    HK: /^\d{8}$/,
    NZ: /^\d{8,9}$/,
    ZA: /^\d{9}$/,
    EG: /^\d{10}$/,
    NG: /^\d{10,11}$/,
    KE: /^\d{9,10}$/,
    MA: /^\d{9,10}$/,
    TN: /^\d{8}$/,
    DZ: /^\d{9}$/,
    SA: /^\d{9}$/,
    AE: /^\d{9}$/,
    IL: /^\d{9,10}$/,
    LK: /^\d{9}$/,
  };

  const pattern = patterns[countryCode.code];
  if (pattern) {
    return pattern.test(phoneNumber);
  }

  return phoneNumber.length >= 7 && phoneNumber.length <= 15;
};

export const getFullPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';
  return `${countryCode.dialCode}${phoneNumber}`;
};















