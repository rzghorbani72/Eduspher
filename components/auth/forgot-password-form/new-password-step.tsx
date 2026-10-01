'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isPasswordValid } from '@/lib/password-utils';
import { PasswordStrength } from '@/components/ui/password-strength';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { Step } from '../_lib/forgot-password-form-helpers';

export function NewPasswordStep({
  errorBlock,
  formData,
  handlePasswordChange,
  handleResetPassword,
  isLoading,
  setShowConfirmPassword,
  setShowPassword,
  setStep,
  showConfirmPassword,
  showPassword,
}: {
  errorBlock: '' | JSX.Element | null;
  formData: { identifier: string; password: string; confirmed_password: string; otp: string };
  handlePasswordChange: (field: 'password' | 'confirmed_password', value: string) => void;
  handleResetPassword: () => Promise<void>;
  isLoading: boolean;
  setShowConfirmPassword: Dispatch<SetStateAction<boolean>>;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<Step>>;
  showConfirmPassword: boolean;
  showPassword: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <div className="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.enterNewPassword')}
          value={formData.password}
          onChange={(e) => handlePasswordChange('password', e.target.value)}
          className="auth-input with-toggle"
          autoComplete="new-password"
          dir="ltr"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="auth-input-toggle"
          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <PasswordStrength password={formData.password} />

      <div className="relative">
        <input
          id="confirmed_password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('auth.confirmNewPasswordPlaceholder')}
          value={formData.confirmed_password}
          onChange={(e) => handlePasswordChange('confirmed_password', e.target.value)}
          className="auth-input with-toggle"
          autoComplete="new-password"
          dir="ltr"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowConfirmPassword((v) => !v)}
          className="auth-input-toggle"
          aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {errorBlock}

      <button
        type="button"
        className="auth-submit-btn"
        onClick={handleResetPassword}
        disabled={isLoading || !isPasswordValid(formData.password) || !formData.confirmed_password}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? t('auth.resetting') : t('auth.resetPassword')}
      </button>

      <button type="button" onClick={() => setStep('otp')} className="auth-secondary-btn">
        {t('common.back')}
      </button>
    </div>
  );
}
