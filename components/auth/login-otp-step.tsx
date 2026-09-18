'use client';

import { Loader2 } from 'lucide-react';

import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useLocaleDigits } from '@/hooks/use-locale-digits';
import { AuthError } from '@/components/auth/auth-notice';
import type { useLogin } from '@/hooks/use-login';

type Login = ReturnType<typeof useLogin>;

const OTP_LENGTH = 5;

/**
 * One code screen for both cases: signing in with a code, and the phone-
 * verification gate that follows a password login on an unverified account.
 */
export function LoginOtpStep({ login }: { login: Login }) {
  const { t } = login;
  const localeDigits = useLocaleDigits();

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        login.submitOtp();
      }}
    >
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold">{t('auth.otpVerification')}</p>
        <p className="text-xs text-[color:var(--auth-card-muted)]">{t('auth.enterOtpHint')}</p>
      </div>

      <div className="auth-identity">
        <bdi className="auth-identity-value">{localeDigits(login.otpTarget)}</bdi>
        <button type="button" onClick={login.changeIdentifier} disabled={login.pending}>
          {t('auth.changeIdentifier')}
        </button>
      </div>

      <div className="auth-otp">
        <OtpBoxInput
          length={OTP_LENGTH}
          value={login.otp}
          onChange={login.setOtp}
          disabled={login.pending}
          onComplete={() => {
            if (!login.pending) login.submitOtp();
          }}
        />

        <div className="auth-otp-resend">
          {login.otpTimer.canResend ? (
            <button
              type="button"
              onClick={login.resendOtp}
              disabled={login.otpResending || login.pending}
            >
              {login.otpResending ? t('auth.resending') : t('auth.resendOtp')}
            </button>
          ) : (
            <span className="tabular-nums">
              {t('auth.resendIn')} <bdi>{login.otpTimer.formatted}</bdi>
            </span>
          )}
        </div>
      </div>

      <AuthError>{login.error}</AuthError>

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={login.pending || login.otp.length < OTP_LENGTH}
      >
        {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {login.pending ? t('auth.signingIn') : t('auth.verifyAndSignIn')}
      </button>
    </form>
  );
}
