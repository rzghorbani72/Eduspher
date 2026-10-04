'use client';

import { useMemo } from 'react';
import { getCountryByCode, getDefaultCountry, type CountryCode } from '@/lib/country-codes';
import {
  toEnglishDigits,
  getPhoneRule,
  checkPhoneNumber,
  cleanPhoneNumber,
} from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useLocaleDigits } from '@/hooks/use-locale-digits';
import { cn } from '@/lib/utils';

const IRAN_MOBILE_PLACEHOLDER = '0912*** ** **';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: CountryCode;
  className?: string;
  inputClassName?: string;
  id?: string;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  lockCountryCode?: string;
}

/**
 * Local Iranian mobile field. The country dial code is not shown — students
 * type 09… and the parent still converts to E.164 with cleanPhoneNumber.
 */
export const PhoneInput = ({
  value = '',
  onChange,
  defaultCountry,
  className,
  inputClassName,
  id,
  autoComplete = 'tel',
  placeholder = IRAN_MOBILE_PLACEHOLDER,
  disabled = false,
  lockCountryCode,
}: PhoneInputProps) => {
  const country = useMemo(
    () =>
      (lockCountryCode ? getCountryByCode(lockCountryCode) : null) ??
      defaultCountry ??
      getDefaultCountry(),
    [lockCountryCode, defaultCountry],
  );
  const localeDigits = useLocaleDigits();
  const { t } = useTranslation();
  const nationalMax = getPhoneRule(country).max;
  const showFormatError = checkPhoneNumber(cleanPhoneNumber(value, country), country) === 'invalid';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = toEnglishDigits(e.target.value).replace(/\D/g, '');
    // Autofill pastes "+98 912 …": longer than a national number means a dial
    // code is in front, so drop it and show the local 09… form.
    const dialCode = country.dialCode.replace('+', '');
    if (digits.length > nationalMax && digits.startsWith(dialCode)) {
      digits = `0${digits.slice(dialCode.length)}`;
    }
    if (digits.startsWith('0')) {
      digits = `0${digits.replace(/^0+/, '')}`.slice(0, nationalMax + 1);
    } else {
      digits = digits.slice(0, nationalMax);
    }
    onChange?.(digits);
  };

  return (
    <div className={cn('relative', className)}>
      <input
        id={id}
        type="tel"
        dir="ltr"
        value={localeDigits(value)}
        onChange={handlePhoneChange}
        autoComplete={autoComplete}
        placeholder={localeDigits(placeholder)}
        disabled={disabled}
        inputMode="numeric"
        className={cn(
          'rounded-theme border-theme bg-card placeholder:text-muted flex h-11 w-full border px-3 text-(--theme-foreground) placeholder:opacity-70',
          disabled && 'cursor-not-allowed opacity-50',
          showFormatError && 'border-destructive',
          inputClassName,
        )}
      />
      {showFormatError && <p className="text-destructive mt-1 text-xs">{t('auth.invalidPhone')}</p>}
    </div>
  );
};
