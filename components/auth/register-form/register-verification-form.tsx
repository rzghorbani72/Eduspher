'use client';

import { Loader2 } from 'lucide-react';

import { PhoneInput } from '@/components/ui/phone-input';
import { AuthOtpField } from '@/components/auth/auth-otp-field';
import { HumanCheck } from '@/components/auth/human-check';
import { getFullPhoneNumber, cleanPhoneNumber, toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { Dispatch, SetStateAction, FormEvent, JSX } from 'react';
import { RegisterValues } from '../_lib/register-form-helpers';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { CountryCode } from '@/lib/country-codes';

export function RegisterVerificationForm({
  canSubmitVerification,
  captcha,
  changeContact,
  emailOtp,
  emailOtpSent,
  emailOtpTimer,
  emailOtpVerified,
  errorBlock,
  errors,
  handleSendEmailOtp,
  handleSendPhoneOtp,
  handleVerificationSubmit,
  handleVerifyEmailOtp,
  handleVerifyPhoneOtp,
  hasEmail,
  isLoading,
  isValidPhone,
  localeDigits,
  otpLoading,
  phoneNumber,
  phoneOtp,
  phoneOtpSent,
  phoneOtpTimer,
  phoneOtpVerified,
  primarySent,
  primaryStepLabel,
  primaryVerificationMethod,
  primaryVerified,
  register,
  selectedCountry,
  setEmailOtp,
  setError,
  setPhoneNumber,
  setPhoneOtp,
  setValue,
  watchedEmail,
}: {
  canSubmitVerification: boolean;
  captcha: {
    token: string;
    setToken: Dispatch<SetStateAction<string>>;
    resetKey: number;
    reset: () => void;
    solved: boolean;
  };
  changeContact: () => void;
  emailOtp: string;
  emailOtpSent: boolean;
  emailOtpTimer: { formatted: string; canResend: boolean; start: () => void };
  emailOtpVerified: boolean;
  errorBlock: JSX.Element | null;
  errors: FieldErrors<RegisterValues>;
  handleSendEmailOtp: () => Promise<void>;
  handleSendPhoneOtp: () => Promise<void>;
  handleVerificationSubmit: (e: React.FormEvent) => Promise<void>;
  handleVerifyEmailOtp: () => Promise<boolean>;
  handleVerifyPhoneOtp: () => Promise<boolean>;
  hasEmail: boolean;
  isLoading: boolean;
  isValidPhone: (phone: string) => boolean;
  localeDigits: (value: string | number) => string;
  otpLoading: boolean;
  phoneNumber: string;
  phoneOtp: string;
  phoneOtpSent: boolean;
  phoneOtpTimer: { formatted: string; canResend: boolean; start: () => void };
  phoneOtpVerified: boolean;
  primarySent: boolean;
  primaryStepLabel: string;
  primaryVerificationMethod: 'phone' | 'email';
  primaryVerified: boolean;
  register: UseFormRegister<RegisterValues>;
  selectedCountry: CountryCode;
  setEmailOtp: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  setPhoneOtp: Dispatch<SetStateAction<string>>;
  setValue: UseFormSetValue<RegisterValues>;
  watchedEmail: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <form onSubmit={handleVerificationSubmit} className="space-y-5">
      {primarySent ? (
        <div className="auth-identity">
          <bdi className="auth-identity-value">
            {primaryVerificationMethod === 'phone' ? localeDigits(phoneNumber) : watchedEmail}
          </bdi>
          <button type="button" onClick={changeContact} disabled={otpLoading || isLoading}>
            {t('auth.changeIdentifier')}
          </button>
        </div>
      ) : primaryVerificationMethod === 'email' ? (
        <div>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder={t('auth.enterEmail')}
            className={cn('auth-input', errors.email && 'has-error')}
            {...register('email')}
            onChange={(e) => {
              e.target.value = toEnglishDigits(e.target.value);
              register('email').onChange(e);
            }}
          />
          {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>}
        </div>
      ) : (
        <div>
          <PhoneInput
            id="phone_number"
            lockCountryCode="IR"
            value={phoneNumber}
            onChange={(value) => {
              setPhoneNumber(value);
              const cleaned = cleanPhoneNumber(value, selectedCountry);
              setValue('phone_number', getFullPhoneNumber(cleaned, selectedCountry), {
                shouldValidate: isValidPhone(value),
              });
            }}
            defaultCountry={selectedCountry}
            className="auth-phone"
          />
          {errors.phone_number && (
            <p className="text-destructive mt-1 text-xs">{errors.phone_number.message}</p>
          )}
        </div>
      )}

      {primaryVerificationMethod === 'phone' ? (
        <AuthOtpField
          label={t('auth.phoneOtp')}
          sendLabel={t('auth.sendPhoneOtp')}
          verifyLabel={t('auth.verifyPhoneOtp')}
          value={phoneOtp}
          onChange={(value) => {
            setPhoneOtp(toEnglishDigits(value));
            setError(null);
          }}
          sent={phoneOtpSent}
          verified={phoneOtpVerified}
          loading={otpLoading}
          canSend={Boolean(phoneNumber) && isValidPhone(phoneNumber) && captcha.solved}
          canResend={phoneOtpTimer.canResend && captcha.solved}
          countdown={phoneOtpTimer.formatted}
          onSend={handleSendPhoneOtp}
          onVerify={handleVerifyPhoneOtp}
          showActions={false}
        />
      ) : (
        <AuthOtpField
          label={t('auth.emailOtp')}
          sendLabel={t('auth.sendEmailOtp')}
          verifyLabel={t('auth.verifyEmailOtp')}
          value={emailOtp}
          onChange={(value) => {
            setEmailOtp(toEnglishDigits(value));
            setError(null);
          }}
          sent={emailOtpSent}
          verified={emailOtpVerified}
          loading={otpLoading}
          canSend={hasEmail && captcha.solved}
          canResend={emailOtpTimer.canResend && captcha.solved}
          countdown={emailOtpTimer.formatted}
          onSend={handleSendEmailOtp}
          onVerify={handleVerifyEmailOtp}
          showActions={false}
        />
      )}

      {!primaryVerified && <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />}

      {errorBlock}

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={isLoading || otpLoading || !canSubmitVerification}
      >
        {(isLoading || otpLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading || otpLoading ? t('auth.processing') : primaryStepLabel}
      </button>
    </form>
  );
}
