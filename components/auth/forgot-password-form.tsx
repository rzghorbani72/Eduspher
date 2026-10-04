'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import Link from '@/components/ui/link';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  validatePhoneAndEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  forgetPassword,
} from '@/lib/api/client';
import { OtpType } from '@/lib/constants';
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
  readAuthIdentifierDraft,
  withAuthIdentifier,
  writeAuthIdentifierDraft,
} from '@/lib/auth/auth-identifier-draft';
import { isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { isPasswordValid, sanitizePasswordInput } from '@/lib/password-utils';
import { useHumanCheck } from '@/hooks/use-human-check';
import { useTranslation } from '@/lib/i18n/hooks';
import { NewPasswordStep } from './forgot-password-form/new-password-step';
import { OtpStep } from './forgot-password-form/otp-step';
import { IdentifierStep } from './forgot-password-form/identifier-step';
import { Step } from './_lib/forgot-password-form-helpers';

function seedFromQuery(raw: string | null): { phone: string; identifier: string } {
  const value = raw?.trim() ?? '';
  const country = getDefaultCountry();
  if (!value) return { phone: '', identifier: '' };
  const phone = toLocalPhoneNumber(value, country) || value.replace(/\D/g, '');
  return { phone, identifier: getFullPhoneNumber(cleanPhoneNumber(phone, country), country) };
}

export const ForgotPasswordForm = () => {
  const buildPath = useStorePath();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const seeded = seedFromQuery(searchParams.get('identifier'));

  const [step, setStep] = useState<Step>('identifier');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const otpTimer = useOtpTimer();
  const notifyOtpSent = useOtpNotifier();
  const captcha = useHumanCheck();

  // v1 is Iran-only: the dial code is fixed, never picked by the visitor.
  const selectedCountry = getDefaultCountry();
  const [phoneNumber, setPhoneNumber] = useState(seeded.phone);

  const [formData, setFormData] = useState({
    identifier: seeded.identifier,
    password: '',
    confirmed_password: '',
    otp: '',
  });

  // Restore the phone from the last auth screen (login/register/forgot).
  useEffect(() => {
    const draft = readAuthIdentifierDraft();
    if (draft?.phone && !searchParams.get('identifier')) {
      setPhoneNumber(draft.phone);
      const cleaned = cleanPhoneNumber(draft.phone, selectedCountry);
      setFormData((prev) => ({
        ...prev,
        identifier: getFullPhoneNumber(cleaned, selectedCountry),
      }));
    }
    setDraftReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    writeAuthIdentifierDraft({ phone: phoneNumber, channel: 'phone' });
  }, [phoneNumber, draftReady]);

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

  const validateIdentifier = () => {
    if (!formData.identifier.trim()) {
      setError(t('auth.identifierRequired'));
      return false;
    }
    if (!isValidPhoneInput(phoneNumber, selectedCountry)) {
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
      await validatePhoneAndEmail(formData.identifier);

      await captcha.run((captchaToken) =>
        sendPhoneOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_PHONE, captchaToken),
      );
      notifyOtpSent(t('auth.otpSentToPhone'), 'forgot-otp');
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
      await verifyPhoneOtp(formData.identifier, formData.otp, OtpType.RESET_PASSWORD_BY_PHONE);
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
    setError(null);
    clearAuthIdentifierDraft();
  };

  const identifierValid = isValidPhoneInput(phoneNumber, selectedCountry);
  const activeIdentifier = toLocalPhoneNumber(formData.identifier, selectedCountry) || phoneNumber;

  const loginHref = withAuthIdentifier(buildPath('/auth/login'), activeIdentifier);

  const errorBlock = error && (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {error}
    </div>
  );

  return (
    <div className="space-y-5">
      {step === 'identifier' && (
        <IdentifierStep
          captcha={captcha}
          errorBlock={errorBlock}
          handlePhoneChange={handlePhoneChange}
          handleSendOtp={handleSendOtp}
          identifierValid={identifierValid}
          isLoading={isLoading}
          phoneNumber={phoneNumber}
          selectedCountry={selectedCountry}
        />
      )}

      {step === 'otp' && (
        <OtpStep
          captcha={captcha}
          errorBlock={errorBlock}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSendOtp={handleSendOtp}
          handleVerifyOtp={handleVerifyOtp}
          isLoading={isLoading}
          otpTimer={otpTimer}
          setStep={setStep}
        />
      )}

      {step === 'password' && (
        <NewPasswordStep
          errorBlock={errorBlock}
          formData={formData}
          handlePasswordChange={handlePasswordChange}
          handleResetPassword={handleResetPassword}
          isLoading={isLoading}
          setShowConfirmPassword={setShowConfirmPassword}
          setShowPassword={setShowPassword}
          setStep={setStep}
          showConfirmPassword={showConfirmPassword}
          showPassword={showPassword}
        />
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
