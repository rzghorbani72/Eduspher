'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Link from '@/components/ui/link';

import {
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  postJson,
  getLegalDocuments,
  resolveAcademyId,
} from '@/lib/api/client';
import { OtpType } from '@/lib/constants';
import { useAuthContext } from '@/components/providers/auth-provider';
import { PhoneInput } from '@/components/ui/phone-input';
import { AuthOtpField } from '@/components/auth/auth-otp-field';
import { RegisterDetailsStep } from '@/components/auth/register-details-step';
import { useStorePath } from '@/components/providers/store-provider';
import { safeRedirectPath } from '@/lib/auth/redirect-target';
import { getDefaultCountry, getCountryByCode } from '@/lib/country-codes';
import {
  getFullPhoneNumber,
  cleanPhoneNumber,
  toEnglishDigits,
  toLocalPhoneNumber,
} from '@/lib/phone-utils';
import { isValidEmail, isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { isPasswordValid } from '@/lib/password-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useLocaleDigits } from '@/hooks/use-locale-digits';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';

type RegisterValues = {
  name: string;
  email?: string;
  phone_number?: string;
  password: string;
  confirmed_password: string;
};

type Step = 'verification' | 'form';

interface RegisterFormProps {
  defaultCountryCode?: string;
  primaryVerificationMethod?: 'phone' | 'email';
}

export const RegisterForm = ({ primaryVerificationMethod = 'phone' }: RegisterFormProps) => {
  const searchParams = useSearchParams();
  // Login sends the identifier it could not find, so signup never asks for it twice.
  const prefilledIdentifier = searchParams.get('identifier') ?? '';
  const redirectParam = searchParams.get('redirect');
  const prefilledIsEmail = prefilledIdentifier.includes('@');
  const selectedCountry = getCountryByCode('IR') ?? getDefaultCountry();
  const prefilledPhone = prefilledIsEmail
    ? ''
    : toLocalPhoneNumber(prefilledIdentifier, selectedCountry);
  const { setAuthenticated } = useAuthContext();
  const buildPath = useStorePath();
  const loginHref = buildPath(
    redirectParam ? `/auth/login?redirect=${encodeURIComponent(redirectParam)}` : '/auth/login',
  );
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('verification');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(true);
  const [legalVersions, setLegalVersions] = useState<{
    terms: string | null;
    privacy: string | null;
  }>({
    terms: null,
    privacy: null,
  });

  useEffect(() => {
    getLegalDocuments()
      .then((docs) => {
        setLegalVersions({
          terms: docs.find((d) => d.type === 'TERMS')?.version ?? null,
          privacy: docs.find((d) => d.type === 'PRIVACY')?.version ?? null,
        });
      })
      .catch(() => {
        setLegalVersions({ terms: null, privacy: null });
      });
  }, []);
  const isSubmittingRef = useRef(false);
  const notifyOtpSent = useOtpNotifier();
  const phoneOtpTimer = useOtpTimer();
  const emailOtpTimer = useOtpTimer();

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t('auth.enterFullName')),
          email:
            primaryVerificationMethod === 'email'
              ? z.string().email(t('auth.invalidEmail'))
              : z.string().email(t('auth.invalidEmail')).optional().or(z.literal('')),
          phone_number:
            primaryVerificationMethod === 'phone'
              ? z.string().min(6, t('auth.invalidPhone'))
              : z.string().min(6, t('auth.invalidPhone')).optional().or(z.literal('')),
          password: z.string().refine(isPasswordValid, t('auth.passwordTooWeak')),
          confirmed_password: z.string().min(1, t('auth.passwordRequired')),
        })
        .refine((v) => v.password === v.confirmed_password, {
          path: ['confirmed_password'],
          message: t('auth.passwordsDoNotMatch'),
        }),
    [t, primaryVerificationMethod],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: prefilledIsEmail ? prefilledIdentifier : '',
      phone_number: prefilledPhone,
      password: '',
      confirmed_password: '',
    },
  });

  const localeDigits = useLocaleDigits();
  const [phoneNumber, setPhoneNumber] = useState(prefilledPhone);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  const isValidPhone = (phone: string) => isValidPhoneInput(phone, selectedCountry);

  const handleSendPhoneOtp = async () => {
    if (!phoneNumber || !isValidPhone(phoneNumber)) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      const fullPhone = getFullPhoneNumber(
        cleanPhoneNumber(phoneNumber, selectedCountry),
        selectedCountry,
      );
      await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
      setPhoneOtpSent(true);
      phoneOtpTimer.start();
      notifyOtpSent(t('auth.otpSentToPhone'), 'register-phone-otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unableToLogin'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (): Promise<boolean> => {
    if (!phoneOtp.trim()) {
      setError(t('auth.enterOtpFirst'));
      return false;
    }
    setOtpLoading(true);
    setError(null);
    try {
      const fullPhone = getFullPhoneNumber(
        cleanPhoneNumber(phoneNumber, selectedCountry),
        selectedCountry,
      );
      const result = await verifyPhoneOtp(fullPhone, phoneOtp, OtpType.REGISTER_PHONE_VERIFICATION);
      if (result.success !== false) {
        setPhoneOtpVerified(true);
        toast.success(t('auth.phoneVerified'));
        return true;
      }
      setError(t('auth.invalidOtp'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidOtp'));
    } finally {
      setOtpLoading(false);
    }
    return false;
  };

  const handleSendEmailOtp = async () => {
    const emailVal = getValues('email');
    if (!emailVal || !isValidEmail(emailVal)) {
      setError(t('auth.invalidEmail'));
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      await sendEmailOtp(emailVal, OtpType.REGISTER_EMAIL_VERIFICATION);
      setEmailOtpSent(true);
      emailOtpTimer.start();
      notifyOtpSent(t('auth.otpSentToEmail'), 'register-email-otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unableToLogin'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (): Promise<boolean> => {
    if (!emailOtp.trim()) {
      setError(t('auth.enterOtpFirst'));
      return false;
    }
    const emailVal = getValues('email');
    if (!emailVal || !isValidEmail(emailVal)) {
      setError(t('auth.emailRequired'));
      return false;
    }
    setOtpLoading(true);
    setError(null);
    try {
      const result = await verifyEmailOtp(emailVal, emailOtp, OtpType.REGISTER_EMAIL_VERIFICATION);
      if (result.success !== false) {
        setEmailOtpVerified(true);
        toast.success(t('auth.emailVerified'));
        return true;
      }
      setError(t('auth.invalidOtp'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidOtp'));
    } finally {
      setOtpLoading(false);
    }
    return false;
  };

  const changeContact = () => {
    setPhoneOtpSent(false);
    setPhoneOtpVerified(false);
    setPhoneOtp('');
    setEmailOtpSent(false);
    setEmailOtpVerified(false);
    setEmailOtp('');
    setError(null);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // One button, one step at a time: send the code, then verify it, then move on.
    if (primaryVerificationMethod === 'phone') {
      if (!phoneOtpSent) {
        await handleSendPhoneOtp();
        return;
      }
      if (!phoneOtpVerified && !(await handleVerifyPhoneOtp())) return;
    } else {
      if (!emailOtpSent) {
        await handleSendEmailOtp();
        return;
      }
      if (!emailOtpVerified && !(await handleVerifyEmailOtp())) return;
    }
    setStep('form');
    setError(null);
  };

  /**
   * Signup already verified the contact and set the password, so the new
   * account is signed in here instead of being sent to the login form. If that
   * call fails the account still exists — fall back to login, not to an error.
   */
  const signInNewAccount = async (identifier: string, password: string, academyId?: string) => {
    try {
      const result = await postJson<{
        phone_verification_required?: boolean;
        password_reset_required?: boolean;
      }>('/auth/public/login', {
        identifier,
        password,
        academy_id: academyId,
      });
      // A gate response carries no session, so claiming one here would leave a
      // "signed in" page whose every request 401s. Login finishes those steps.
      if (result?.phone_verification_required || result?.password_reset_required) {
        window.location.href = loginHref;
        return;
      }
      setAuthenticated(true);
      const { loadAndMergeCart } = await import('@/app/actions/cart');
      loadAndMergeCart().catch(() => {});
      window.location.href = safeRedirectPath(redirectParam, buildPath('/account'));
    } catch {
      window.location.href = loginHref;
    }
  };

  const onFormSubmit = handleSubmit(async (values) => {
    if (isLoading || isSubmittingRef.current) return;
    setIsLoading(true);
    isSubmittingRef.current = true;
    setError(null);
    try {
      const primaryVerified =
        primaryVerificationMethod === 'phone' ? phoneOtpVerified : emailOtpVerified;
      if (!primaryVerified) {
        setError(
          primaryVerificationMethod === 'phone'
            ? t('auth.phoneVerifyFirst')
            : t('auth.emailVerifyFirst'),
        );
        return;
      }

      if (!acceptedLegal) {
        setError(t('legal.mustAcceptTerms'));
        return;
      }

      if (!legalVersions.terms || !legalVersions.privacy) {
        setError(t('legal.documentsUnavailable'));
        return;
      }

      const finalAcademyId = resolveAcademyId() ?? undefined;

      const userData: {
        name?: string;
        display_name?: string;
        password?: string;
        confirmed_password?: string;
        role: string;
        academy_id?: string;
        phone_number?: string;
        phone_otp?: string;
        email?: string;
        email_otp?: string;
        accepted_terms_version?: string;
        accepted_privacy_version?: string;
      } = {
        name: values.name,
        display_name: values.name,
        password: values.password,
        confirmed_password: values.confirmed_password,
        role: 'USER',
        academy_id: finalAcademyId,
        accepted_terms_version: legalVersions.terms,
        accepted_privacy_version: legalVersions.privacy,
      };

      if (primaryVerificationMethod === 'phone') {
        if (!phoneNumber || !isValidPhone(phoneNumber)) {
          setError(t('auth.phoneRequired'));
          return;
        }
        userData.phone_number = getFullPhoneNumber(
          cleanPhoneNumber(phoneNumber, selectedCountry),
          selectedCountry,
        );
        userData.phone_otp = phoneOtpVerified && phoneOtp.trim() ? phoneOtp.trim() : undefined;
      } else {
        if (!values.email || !isValidEmail(values.email)) {
          setError(t('auth.emailRequired'));
          return;
        }
        userData.email = values.email;
        userData.email_otp = emailOtpVerified && emailOtp.trim() ? emailOtp.trim() : undefined;
      }

      await postJson('/auth/register', userData);
      toast.success(t('auth.registrationSuccess'));
      await signInNewAccount(
        userData.phone_number ?? userData.email ?? '',
        userData.password ?? '',
        finalAcademyId,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unableToCreateAccount'));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  });

  const primarySent = primaryVerificationMethod === 'phone' ? phoneOtpSent : emailOtpSent;
  const primaryVerified =
    primaryVerificationMethod === 'phone' ? phoneOtpVerified : emailOtpVerified;
  // The one button carries the step it actually performs: send, verify, continue.
  const primaryStepLabel = !primarySent
    ? t('auth.sendVerificationCode')
    : !primaryVerified
      ? t('auth.verifyAndContinue')
      : t('auth.continueLabel');

  const watchedEmail = watch('email');
  const hasEmail = Boolean(watchedEmail && isValidEmail(watchedEmail));
  const identifierValid =
    primaryVerificationMethod === 'phone' ? isValidPhone(phoneNumber) : hasEmail;
  // The single button walks send → verify → continue, so each step turns it on
  // only once that step's own input is complete.
  const canSubmitVerification = !primarySent
    ? identifierValid
    : primaryVerified ||
      (primaryVerificationMethod === 'phone'
        ? phoneOtp.trim().length > 0
        : emailOtp.trim().length > 0);

  const errorBlock = error ? (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {error}
    </div>
  ) : null;

  return (
    <div className="space-y-5">
      {step === 'verification' && (
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
              {errors.email && (
                <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
              )}
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
              canSend={Boolean(phoneNumber) && isValidPhone(phoneNumber)}
              canResend={phoneOtpTimer.canResend}
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
              canSend={hasEmail}
              canResend={emailOtpTimer.canResend}
              countdown={emailOtpTimer.formatted}
              onSend={handleSendEmailOtp}
              onVerify={handleVerifyEmailOtp}
              showActions={false}
            />
          )}

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
      )}

      {step === 'form' && (
        <RegisterDetailsStep
          password={watch('password')}
          fields={{
            name: register('name'),
            password: register('password'),
            confirmed_password: register('confirmed_password'),
          }}
          errors={{
            name: errors.name?.message,
            password: errors.password?.message,
            confirmed_password: errors.confirmed_password?.message,
          }}
          loading={isLoading}
          verifiedLabel={
            primaryVerificationMethod === 'phone'
              ? t('auth.phoneVerified')
              : t('auth.emailVerified')
          }
          verifiedHint={
            primaryVerificationMethod === 'phone'
              ? t('auth.verifyEmailLater')
              : t('auth.verifyPhoneLater')
          }
          acceptedLegal={acceptedLegal}
          onAcceptedLegalChange={(value) => {
            setAcceptedLegal(value);
            setError(null);
          }}
          termsHref={buildPath('/terms')}
          privacyHref={buildPath('/privacy')}
          notice={errorBlock}
          onBack={() => setStep('verification')}
          onSubmit={onFormSubmit}
        />
      )}

      <p className="text-muted-foreground mt-6 text-center text-sm">
        <Link
          href={loginHref}
          className="font-medium text-[color:var(--auth-accent)] hover:underline"
        >
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );
};
