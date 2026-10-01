'use client';

import { Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { HumanCheck } from '@/components/auth/human-check';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { AuthMethod } from '../_lib/forgot-password-form-helpers';
import { CountryCode } from '@/lib/country-codes';

export function IdentifierStep({
  authMethod,
  captcha,
  email,
  errorBlock,
  handleEmailChange,
  handlePhoneChange,
  handleSendOtp,
  identifierValid,
  isLoading,
  phoneNumber,
  selectedCountry,
  switchMethod,
}: {
  authMethod: AuthMethod;
  captcha: {
    token: string;
    setToken: Dispatch<SetStateAction<string>>;
    resetKey: number;
    reset: () => void;
    solved: boolean;
  };
  email: string;
  errorBlock: '' | JSX.Element | null;
  handleEmailChange: (value: string) => void;
  handlePhoneChange: (value: string) => void;
  handleSendOtp: () => Promise<void>;
  identifierValid: boolean;
  isLoading: boolean;
  phoneNumber: string;
  selectedCountry: CountryCode;
  switchMethod: (m: AuthMethod) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <div className="auth-segment">
        {(['phone', 'email'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMethod(m)}
            className={cn('auth-segment-item', authMethod === m && 'on')}
          >
            {m === 'email' ? t('auth.email') : t('auth.phone')}
          </button>
        ))}
      </div>

      {authMethod === 'email' ? (
        <input
          id="identifier"
          type="email"
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder={t('auth.enterEmail')}
          className="auth-input"
        />
      ) : (
        <PhoneInput
          id="identifier"
          value={phoneNumber}
          onChange={handlePhoneChange}
          lockCountryCode={selectedCountry.code}
          autoComplete="tel"
          className="auth-phone"
        />
      )}

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
