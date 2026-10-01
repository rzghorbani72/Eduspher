'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from '@/components/ui/link';

import { getLegalDocuments } from '@/lib/api/client';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useHumanCheck } from '@/hooks/use-human-check';
import { useStorePath } from '@/components/providers/store-provider';
import { getDefaultCountry, getCountryByCode } from '@/lib/country-codes';
import { toLocalPhoneNumber } from '@/lib/phone-utils';
import { isValidEmail, isValidPhoneInput } from '@/lib/auth/identifier-validation';
import {
  isEmailIdentifier,
  readAuthIdentifierDraft,
  withAuthIdentifier,
  writeAuthIdentifierDraft,
} from '@/lib/auth/auth-identifier-draft';
import { isPasswordValid } from '@/lib/password-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useLocaleDigits } from '@/hooks/use-locale-digits';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';
import { RegisterDetailsPanel } from './register-form/register-details-panel';
import { RegisterVerificationForm } from './register-form/register-verification-form';
import { RegisterValues, Step } from './_lib/register-form-helpers';
import { useRegisterOtp } from './register-form/use-register-otp';
import { useRegisterSubmit } from './register-form/use-register-submit';

interface RegisterFormProps {
  defaultCountryCode?: string;
  primaryVerificationMethod?: 'phone' | 'email';
}

export const RegisterForm = ({ primaryVerificationMethod = 'phone' }: RegisterFormProps) => {
  const searchParams = useSearchParams();
  // Login sends the identifier it could not find, so signup never asks for it twice.
  const prefilledIdentifier = searchParams.get('identifier') ?? '';
  const redirectParam = searchParams.get('redirect');
  const prefilledIsEmail = isEmailIdentifier(prefilledIdentifier);
  const selectedCountry = getCountryByCode('IR') ?? getDefaultCountry();
  const prefilledPhone = prefilledIsEmail
    ? ''
    : toLocalPhoneNumber(prefilledIdentifier, selectedCountry);
  const { setAuthenticated } = useAuthContext();
  const buildPath = useStorePath();
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
  // One captcha for the verification step — a fresh solve gates every send/resend.
  const captcha = useHumanCheck();
  // Signup does not open a session, so the automatic first login needs its own check.
  const loginCaptcha = useHumanCheck();

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

  // Restore the other identifier (phone↔email) from login/forgot drafts.
  useEffect(() => {
    const draft = readAuthIdentifierDraft();
    if (!draft) return;
    if (!prefilledIsEmail && draft.email) setValue('email', draft.email);
    if ((prefilledIsEmail || !prefilledIdentifier) && draft.phone) {
      setPhoneNumber((prev) => prev || draft.phone);
      setValue('phone_number', draft.phone);
    }
    if (!prefilledIdentifier && draft.email) setValue('email', draft.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once
  }, []);

  const watchedEmail = watch('email');
  const loginHref = withAuthIdentifier(
    buildPath('/auth/login'),
    (primaryVerificationMethod === 'email' ? watchedEmail : phoneNumber) ||
      prefilledIdentifier ||
      '',
    redirectParam ? { redirect: redirectParam } : undefined,
  );

  useEffect(() => {
    writeAuthIdentifierDraft({
      phone: phoneNumber,
      email: watchedEmail ?? '',
      channel: primaryVerificationMethod,
    });
  }, [phoneNumber, watchedEmail, primaryVerificationMethod]);

  const isValidPhone = (phone: string) => isValidPhoneInput(phone, selectedCountry);

  const {
    changeContact,
    handleSendEmailOtp,
    handleSendPhoneOtp,
    handleVerifyEmailOtp,
    handleVerifyPhoneOtp,
  } = useRegisterOtp({
    captcha,
    emailOtp,
    emailOtpTimer,
    getValues,
    isValidPhone,
    notifyOtpSent,
    phoneNumber,
    phoneOtp,
    phoneOtpTimer,
    selectedCountry,
    setEmailOtp,
    setEmailOtpSent,
    setEmailOtpVerified,
    setError,
    setOtpLoading,
    setPhoneOtp,
    setPhoneOtpSent,
    setPhoneOtpVerified,
    setStep,
  });

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
  const { onFormSubmit } = useRegisterSubmit({
    acceptedLegal,
    buildPath,
    emailOtp,
    emailOtpVerified,
    handleSubmit,
    isLoading,
    isSubmittingRef,
    isValidPhone,
    legalVersions,
    loginCaptcha,
    loginHref,
    phoneNumber,
    phoneOtp,
    phoneOtpVerified,
    primaryVerificationMethod,
    redirectParam,
    selectedCountry,
    setAuthenticated,
    setError,
    setIsLoading,
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

  const hasEmail = Boolean(watchedEmail && isValidEmail(watchedEmail));
  const identifierValid =
    primaryVerificationMethod === 'phone' ? isValidPhone(phoneNumber) : hasEmail;
  // The single button walks send → verify → continue, so each step turns it on
  // only once that step's own input is complete.
  const canSubmitVerification = !primarySent
    ? identifierValid && captcha.solved
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
        <RegisterVerificationForm
          canSubmitVerification={canSubmitVerification}
          captcha={captcha}
          changeContact={changeContact}
          emailOtp={emailOtp}
          emailOtpSent={emailOtpSent}
          emailOtpTimer={emailOtpTimer}
          emailOtpVerified={emailOtpVerified}
          errorBlock={errorBlock}
          errors={errors}
          handleSendEmailOtp={handleSendEmailOtp}
          handleSendPhoneOtp={handleSendPhoneOtp}
          handleVerificationSubmit={handleVerificationSubmit}
          handleVerifyEmailOtp={handleVerifyEmailOtp}
          handleVerifyPhoneOtp={handleVerifyPhoneOtp}
          hasEmail={hasEmail}
          isLoading={isLoading}
          isValidPhone={isValidPhone}
          localeDigits={localeDigits}
          otpLoading={otpLoading}
          phoneNumber={phoneNumber}
          phoneOtp={phoneOtp}
          phoneOtpSent={phoneOtpSent}
          phoneOtpTimer={phoneOtpTimer}
          phoneOtpVerified={phoneOtpVerified}
          primarySent={primarySent}
          primaryStepLabel={primaryStepLabel}
          primaryVerificationMethod={primaryVerificationMethod}
          primaryVerified={primaryVerified}
          register={register}
          selectedCountry={selectedCountry}
          setEmailOtp={setEmailOtp}
          setError={setError}
          setPhoneNumber={setPhoneNumber}
          setPhoneOtp={setPhoneOtp}
          setValue={setValue}
          watchedEmail={watchedEmail}
        />
      )}

      {step === 'form' && (
        <RegisterDetailsPanel
          acceptedLegal={acceptedLegal}
          buildPath={buildPath}
          errorBlock={errorBlock}
          errors={errors}
          isLoading={isLoading}
          loginCaptcha={loginCaptcha}
          onFormSubmit={onFormSubmit}
          primaryVerificationMethod={primaryVerificationMethod}
          register={register}
          setAcceptedLegal={setAcceptedLegal}
          setError={setError}
          setStep={setStep}
          watch={watch}
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
