'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import Link from '@/components/ui/link';
import { CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  validatePhoneAndEmail,
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  forgetPassword,
} from '@/lib/api/client';
import { OtpType } from '@/lib/constants';
import { PhoneInput } from '@/components/ui/phone-input';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';
import { useStorePath } from '@/components/providers/store-provider';
import { getDefaultCountry } from '@/lib/country-codes';
import {
  getFullPhoneNumber,
  cleanPhoneNumber,
  toEnglishDigits,
  toLocalPhoneNumber,
} from '@/lib/phone-utils';
import {
  clearAuthIdentifierDraft,
  isEmailIdentifier,
  readAuthIdentifierDraft,
  withAuthIdentifier,
  writeAuthIdentifierDraft,
} from '@/lib/auth/auth-identifier-draft';
import { isValidEmail, isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { isPasswordValid, sanitizePasswordInput } from '@/lib/password-utils';
import { PasswordStrength } from '@/components/ui/password-strength';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type Step = 'identifier' | 'otp' | 'password' | 'success';
type AuthMethod = 'email' | 'phone';

const OTP_LENGTH = 5;

function seedFromQuery(raw: string | null): {
  method: AuthMethod;
  email: string;
  phone: string;
  identifier: string;
} {
  const value = raw?.trim() ?? '';
  const country = getDefaultCountry();
  if (!value) return { method: 'phone', email: '', phone: '', identifier: '' };
  if (isEmailIdentifier(value)) {
    const email = toEnglishDigits(value);
    return { method: 'email', email, phone: '', identifier: email };
  }
  const phone = toLocalPhoneNumber(value, country) || value.replace(/\D/g, '');
  const cleaned = cleanPhoneNumber(phone, country);
  return {
    method: 'phone',
    email: '',
    phone,
    identifier: getFullPhoneNumber(cleaned, country),
  };
}

export const ForgotPasswordForm = () => {
  const buildPath = useStorePath();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const seeded = seedFromQuery(searchParams.get('identifier'));

  const [step, setStep] = useState<Step>('identifier');
  const [authMethod, setAuthMethod] = useState<AuthMethod>(seeded.method);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const otpTimer = useOtpTimer();
  const notifyOtpSent = useOtpNotifier();

  // v1 is Iran-only: the dial code is fixed, never picked by the visitor.
  const selectedCountry = getDefaultCountry();
  const [phoneNumber, setPhoneNumber] = useState(seeded.phone);
  const [email, setEmail] = useState(seeded.email);

  const [formData, setFormData] = useState({
    identifier: seeded.identifier,
    password: '',
    confirmed_password: '',
    otp: '',
  });

  // Restore phone + email from the last auth screen (login/register/forgot).
  useEffect(() => {
    const draft = readAuthIdentifierDraft();
    if (draft) {
      setPhoneNumber((prev) => prev || draft.phone);
      setEmail((prev) => prev || draft.email);
      if (!searchParams.get('identifier') && (draft.phone || draft.email)) {
        setAuthMethod(draft.channel);
        if (draft.channel === 'email' && draft.email) {
          setFormData((prev) => ({ ...prev, identifier: draft.email }));
        } else if (draft.phone) {
          const cleaned = cleanPhoneNumber(draft.phone, selectedCountry);
          setFormData((prev) => ({
            ...prev,
            identifier: getFullPhoneNumber(cleaned, selectedCountry),
          }));
        }
      } else if (seeded.method === 'email' && draft.phone) {
        setPhoneNumber((prev) => prev || draft.phone);
      } else if (seeded.method === 'phone' && draft.email) {
        setEmail((prev) => prev || draft.email);
      }
    }
    setDraftReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    writeAuthIdentifierDraft({ phone: phoneNumber, email, channel: authMethod });
  }, [phoneNumber, email, authMethod, draftReady]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: toEnglishDigits(value) }));
    setError(null);
  };

  const handlePasswordChange = (field: 'password' | 'confirmed_password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: sanitizePasswordInput(value) }));
    setError(null);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const cleaned = cleanPhoneNumber(value, selectedCountry);
    setFormData((prev) => ({
      ...prev,
      identifier: getFullPhoneNumber(cleaned, selectedCountry),
    }));
    setError(null);
  };

  const handleEmailChange = (value: string) => {
    const v = toEnglishDigits(value);
    setEmail(v);
    setFormData((prev) => ({ ...prev, identifier: v }));
    setError(null);
  };

  const switchMethod = (m: AuthMethod) => {
    setAuthMethod(m);
    setError(null);
    if (m === 'email' && email) {
      setFormData((prev) => ({ ...prev, identifier: email }));
    } else if (m === 'phone' && phoneNumber) {
      const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
      setFormData((prev) => ({
        ...prev,
        identifier: getFullPhoneNumber(cleaned, selectedCountry),
      }));
    }
    writeAuthIdentifierDraft({ channel: m, phone: phoneNumber, email });
  };

  const validateIdentifier = () => {
    if (!formData.identifier.trim()) {
      setError(t('auth.identifierRequired'));
      return false;
    }
    if (authMethod === 'email' && !isValidEmail(formData.identifier)) {
      setError(t('auth.invalidEmail'));
      return false;
    }
    if (authMethod === 'phone' && !isValidPhoneInput(phoneNumber, selectedCountry)) {
      setError(t('auth.invalidPhone'));
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!formData.password.trim()) {
      setError(t('auth.passwordRequired'));
      return false;
    }
    if (!isPasswordValid(formData.password)) {
      setError(t('auth.passwordTooWeak'));
      return false;
    }
    if (formData.password !== formData.confirmed_password) {
      setError(t('auth.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateIdentifier()) return;
    setIsLoading(true);
    setError(null);
    try {
      const phone = authMethod === 'phone' ? formData.identifier : undefined;
      const emailVal = authMethod === 'email' ? formData.identifier : undefined;
      await validatePhoneAndEmail(phone, emailVal);

      if (authMethod === 'email') {
        await sendEmailOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_EMAIL);
        notifyOtpSent(t('auth.otpSentToEmail'), 'forgot-otp');
      } else {
        await sendPhoneOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_PHONE);
        notifyOtpSent(t('auth.otpSentToPhone'), 'forgot-otp');
      }
      setStep('otp');
      otpTimer.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unableToLogin'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      setError(t('auth.enterOtpFirst'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (authMethod === 'email') {
        await verifyEmailOtp(formData.identifier, formData.otp, OtpType.RESET_PASSWORD_BY_EMAIL);
      } else {
        await verifyPhoneOtp(formData.identifier, formData.otp, OtpType.RESET_PASSWORD_BY_PHONE);
      }
      setStep('password');
      toast.success(t('auth.otpVerifiedSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    setIsLoading(true);
    setError(null);
    try {
      await forgetPassword({
        identifier: formData.identifier,
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp,
      });
      clearAuthIdentifierDraft();
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unableToLogin'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('identifier');
    setFormData({
      identifier: '',
      password: '',
      confirmed_password: '',
      otp: '',
    });
    setPhoneNumber('');
    setEmail('');
    setError(null);
    clearAuthIdentifierDraft();
  };

  const identifierValid =
    authMethod === 'phone' ? isValidPhoneInput(phoneNumber, selectedCountry) : isValidEmail(email);

  const activeIdentifier =
    authMethod === 'email'
      ? email || formData.identifier
      : toLocalPhoneNumber(formData.identifier, selectedCountry) || phoneNumber;

  const loginHref = withAuthIdentifier(buildPath('/auth/login'), activeIdentifier);

  const errorBlock = error && (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {error}
    </div>
  );

  return (
    <div className="space-y-5">
      {step === 'identifier' && (
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

          {errorBlock}

          <button
            type="button"
            className="auth-submit-btn"
            onClick={handleSendOtp}
            disabled={isLoading || !identifierValid}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? t('auth.sending') : t('auth.sendOtp')}
          </button>
        </div>
      )}

      {step === 'otp' && (
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

          <button
            type="button"
            onClick={() => setStep('identifier')}
            className="auth-secondary-btn"
          >
            {t('common.back')}
          </button>

          <div className="text-center">
            {otpTimer.canResend ? (
              <button
                type="button"
                className="text-sm text-(--auth-accent) hover:underline"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {t('auth.resendOtp')}
              </button>
            ) : (
              <p className="auth-otp-resend tabular-nums">
                {t('auth.resendIn')} <bdi>{otpTimer.formatted}</bdi>
              </p>
            )}
          </div>
        </div>
      )}

      {step === 'password' && (
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
            disabled={
              isLoading || !isPasswordValid(formData.password) || !formData.confirmed_password
            }
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? t('auth.resetting') : t('auth.resetPassword')}
          </button>

          <button type="button" onClick={() => setStep('otp')} className="auth-secondary-btn">
            {t('common.back')}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('auth.passwordResetSuccess')}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{t('auth.passwordResetDesc')}</p>
          </div>
          <Link href={loginHref} className="auth-submit-btn">
            {t('auth.goToLogin')}
          </Link>

          <button type="button" onClick={resetForm} className="auth-secondary-btn">
            {t('auth.resetAnotherPassword')}
          </button>
        </div>
      )}

      {step !== 'success' && (
        <div className="text-center text-sm">
          <Link href={loginHref} className="font-semibold text-(--auth-accent) hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </div>
      )}
    </div>
  );
};
