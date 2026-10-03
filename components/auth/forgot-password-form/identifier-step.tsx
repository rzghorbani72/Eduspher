'use client';

import { Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { HumanCheck } from '@/components/auth/human-check';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { CountryCode } from '@/lib/country-codes';

export function IdentifierStep({
  captcha,
  errorBlock,
  handlePhoneChange,
  handleSendOtp,
  identifierValid,
  isLoading,
  phoneNumber,
  selectedCountry,
}: {
  captcha: {
    token: string;
    setToken: Dispatch<SetStateAction<string>>;
    resetKey: number;
    reset: () => void;
    solved: boolean;
  };
  errorBlock: '' | JSX.Element | null;
  handlePhoneChange: (value: string) => void;
  handleSendOtp: () => Promise<void>;
  identifierValid: boolean;
  isLoading: boolean;
  phoneNumber: string;
  selectedCountry: CountryCode;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <PhoneInput
        id="identifier"
        value={phoneNumber}
        onChange={handlePhoneChange}
        lockCountryCode={selectedCountry.code}
        autoComplete="tel"
        className="auth-phone"
      />

      <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />

      {errorBlock}

      <button
        type="button"
        className="auth-submit-btn"
        onClick={handleSendOtp}
        disabled={isLoading || !identifierValid || !captcha.solved}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? t('auth.sending') : t('auth.sendOtp')}
      </button>
    </div>
  );
}
