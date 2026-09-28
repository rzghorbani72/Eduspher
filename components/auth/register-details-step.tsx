'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { AuthField } from '@/components/auth/auth-field';
import { HumanCheck } from '@/components/auth/human-check';
import { PasswordStrength } from '@/components/ui/password-strength';
import type { HumanCheckState } from '@/hooks/use-human-check';
import { useTranslation } from '@/lib/i18n/hooks';
import { sanitizePasswordInput } from '@/lib/password-utils';

export type RegisterFieldErrors = Partial<
  Record<'name' | 'password' | 'confirmed_password', string>
>;

interface RegisterDetailsStepProps {
  fields: {
    name: UseFormRegisterReturn;
    password: UseFormRegisterReturn;
    confirmed_password: UseFormRegisterReturn;
  };
  errors: RegisterFieldErrors;
  /** Live value of the password field, for the strength checklist. */
  password: string;
  loading: boolean;
  verifiedLabel: string;
  verifiedHint: string;
  acceptedLegal: boolean;
  onAcceptedLegalChange: (value: boolean) => void;
  termsHref: string;
  privacyHref: string;
  notice?: React.ReactNode;
  /** Signup does not open a session — the automatic first login needs its own check. */
  captcha: HumanCheckState;
  onBack: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

/** Passwords are English-only: Persian digits convert, Persian letters drop. */
const withAsciiPassword = (field: UseFormRegisterReturn): UseFormRegisterReturn => ({
  ...field,
  onChange: (event: { target: HTMLInputElement }) => {
    event.target.value = sanitizePasswordInput(event.target.value);
    return field.onChange(event);
  },
});

/**
 * Register step 2: the account details, laid out as the single-column pill
 * stack the AdminPanel auth screens use — placeholder labels, one white
 * surface, no theme-coloured chrome leaking onto the auth card.
 */
export function RegisterDetailsStep({
  fields,
  errors,
  password,
  loading,
  verifiedLabel,
  verifiedHint,
  acceptedLegal,
  onAcceptedLegalChange,
  termsHref,
  privacyHref,
  notice,
  captcha,
  onBack,
  onSubmit,
}: RegisterDetailsStepProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="auth-verified-note">
        <span className="auth-verified-note-title">
          <CheckCircle2 className="h-4 w-4" />
          {verifiedLabel}
        </span>
        <span className="auth-verified-note-hint">{verifiedHint}</span>
      </div>

      <AuthField
        label={t('account.fullName')}
        autoComplete="name"
        dir="auto"
        disabled={loading}
        error={errors.name}
        {...fields.name}
      />

      <div className="space-y-1.5">
        <AuthField
          label={t('auth.password')}
          type="password"
          dir="ltr"
          autoComplete="new-password"
          disabled={loading}
          error={errors.password}
          {...withAsciiPassword(fields.password)}
        />
        <PasswordStrength password={password} />
      </div>

      <AuthField
        label={t('auth.confirmPassword')}
        type="password"
        dir="ltr"
        autoComplete="new-password"
        disabled={loading}
        error={errors.confirmed_password}
        {...withAsciiPassword(fields.confirmed_password)}
      />

      <label className="auth-fine-print">
        <input
          type="checkbox"
          checked={acceptedLegal}
          onChange={(e) => onAcceptedLegalChange(e.target.checked)}
          disabled={loading}
          className="auth-checkbox"
        />
        <span>
          {t('legal.acceptPrefix')}{' '}
          <a href={termsHref} target="_blank" rel="noreferrer">
            {t('auth.termsOfService')}
          </a>{' '}
          {t('legal.and')}{' '}
          <a href={privacyHref} target="_blank" rel="noreferrer">
            {t('legal.privacyPolicy')}
          </a>{' '}
          {t('legal.acceptSuffix')}
        </span>
      </label>

      <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />

      {notice}

      <button type="submit" className="auth-submit-btn" disabled={loading || !captcha.solved}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t('auth.registering') : t('auth.register')}
      </button>

      <button type="button" onClick={onBack} className="auth-secondary-btn" disabled={loading}>
        {t('auth.backToVerification')}
      </button>
    </form>
  );
}
