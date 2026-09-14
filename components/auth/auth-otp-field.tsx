'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';

import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useTranslation } from '@/lib/i18n/hooks';

interface AuthOtpFieldProps {
  label: string;
  sendLabel: string;
  verifyLabel: string;
  value: string;
  onChange: (value: string) => void;
  sent: boolean;
  verified: boolean;
  loading: boolean;
  canSend: boolean;
  canResend: boolean;
  countdown: string;
  onSend: () => void;
  onVerify: () => void;
  length?: number;
  /** false when the screen's primary button already drives send/verify. */
  showActions?: boolean;
}

/**
 * One verification code field, staged so only the next action is on screen:
 * send → enter + resend/countdown → verified. Mirrors the AdminPanel auth OTP
 * screen so both apps ask for a code the same way.
 */
export function AuthOtpField({
  label,
  sendLabel,
  verifyLabel,
  value,
  onChange,
  sent,
  verified,
  loading,
  canSend,
  canResend,
  countdown,
  onSend,
  onVerify,
  length = 5,
  showActions = true,
}: AuthOtpFieldProps) {
  const { t } = useTranslation();

  if (verified) {
    return (
      <div className="auth-otp">
        <span className="auth-otp-label">{label}</span>
        <p className="auth-otp-verified">
          <CheckCircle2 className="h-4 w-4" />
          {t('auth.verified')}
        </p>
      </div>
    );
  }

  if (!sent) {
    if (!showActions) return null;
    return (
      <div className="auth-otp">
        <span className="auth-otp-label">{label}</span>
        <button
          type="button"
          className="auth-ghost-btn"
          onClick={onSend}
          disabled={loading || !canSend}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? t('auth.sending') : sendLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-otp">
      <span className="auth-otp-label">{label}</span>

      <OtpBoxInput
        length={length}
        value={value}
        onChange={onChange}
        disabled={loading}
        onComplete={() => {
          if (!loading) onVerify();
        }}
      />

      <div className="auth-otp-resend">
        {canResend ? (
          <button type="button" onClick={onSend} disabled={loading}>
            {loading ? t('auth.sending') : t('auth.resendOtp')}
          </button>
        ) : (
          <span className="tabular-nums">
            {t('auth.resendIn')} <bdi>{countdown}</bdi>
          </span>
        )}
      </div>

      {showActions && (
        <button
          type="button"
          className="auth-ghost-btn"
          onClick={onVerify}
          disabled={loading || value.length < length}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? t('auth.verifying') : verifyLabel}
        </button>
      )}
    </div>
  );
}
