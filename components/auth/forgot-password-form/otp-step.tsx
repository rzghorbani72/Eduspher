'use client';

import { Loader2 } from 'lucide-react';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { HumanCheck } from '@/components/auth/human-check';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction, JSX } from 'react';
import type { HumanCheckState } from '@/hooks/use-human-check';
import { Step, OTP_LENGTH } from '../_lib/forgot-password-form-helpers';

export function OtpStep({
  captcha,
  errorBlock,
  formData,
  handleInputChange,
  handleSendOtp,
  handleVerifyOtp,
  isLoading,
  otpTimer,
  setStep,
}: {
  captcha: HumanCheckState;
  errorBlock: '' | JSX.Element | null;
  formData: { identifier: string; password: string; confirmed_password: string; otp: string };
  handleInputChange: (field: string, value: string) => void;
  handleSendOtp: () => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
  isLoading: boolean;
  otpTimer: { formatted: string; canResend: boolean; start: () => void };
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <div className="auth-otp">
        <span className="auth-otp-label">{t('auth.otpVerification')}</span>
        <OtpBoxInput
          length={OTP_LENGTH}
          value={formData.otp}
          onChange={(value) => handleInputChange('otp', value)}
          disabled={isLoading}
          onComplete={() => {
            if (!isLoading) void handleVerifyOtp();
          }}
        />
      </div>

      {errorBlock}

      <button
        type="button"
        className="auth-submit-btn"
        onClick={handleVerifyOtp}
        disabled={isLoading || formData.otp.length < OTP_LENGTH}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? t('auth.verifying') : t('auth.verifyOtp')}
      </button>

      <button type="button" onClick={() => setStep('identifier')} className="auth-secondary-btn">
        {t('common.back')}
      </button>

      <div className="text-center">
        {otpTimer.canResend ? (
          <div className="flex flex-col items-center gap-2">
            <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />
            <button
              type="button"
              className="text-sm text-(--auth-accent) hover:underline"
              onClick={handleSendOtp}
              disabled={isLoading || !captcha.solved}
            >
              {t('auth.resendOtp')}
            </button>
          </div>
        ) : (
          <p className="auth-otp-resend tabular-nums">
            {t('auth.resendIn')} <bdi>{otpTimer.formatted}</bdi>
          </p>
        )}
      </div>
    </div>
  );
}
