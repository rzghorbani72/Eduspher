'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'react-toastify';

import { getLegalDocuments, quickJoin, sendPhoneOtp, verifyPhoneOtp } from '@/lib/api/client';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';
import { useHumanCheck } from '@/hooks/use-human-check';
import { useAuthContext } from '@/components/providers/auth-provider';
import { OtpType } from '@/lib/constants';
import { isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { getDefaultCountry } from '@/lib/country-codes';
import { cleanPhoneNumber, getFullPhoneNumber, toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';

export type QuickEnrollStep = 'phone' | 'otp';

type LegalVersions = { terms: string; privacy: string } | null;

/**
 * Phone-only sign-in/sign-up for the enroll dialog. One phone box, one code
 * box; the verified code is handed straight to `quickJoin`, which signs an
 * existing member in and creates a new one — either way, one round trip.
 */
export function useQuickEnrollAuth(onDone: () => void) {
  const { t } = useTranslation();
  const { setAuthenticated } = useAuthContext();
  const notifyOtpSent = useOtpNotifier();
  const timer = useOtpTimer();
  const country = getDefaultCountry();
  const captcha = useHumanCheck();
  const resendCaptcha = useHumanCheck();

  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<QuickEnrollStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [legal, setLegal] = useState<LegalVersions>(null);

  useEffect(() => {
    getLegalDocuments()
      .then((docs) => {
        const terms = docs.find((d) => d.type === 'TERMS')?.version;
        const privacy = docs.find((d) => d.type === 'PRIVACY')?.version;
        setLegal(terms && privacy ? { terms, privacy } : null);
      })
      .catch(() => setLegal(null));
  }, []);

  const fullPhone = phoneNumber
    ? getFullPhoneNumber(cleanPhoneNumber(phoneNumber, country), country)
    : '';
  const phoneValid = isValidPhoneInput(phoneNumber, country);

  const failed = (err: unknown) =>
    setError(err instanceof Error ? err.message : t('auth.unableToLogin'));

  function submitPhone() {
    if (!phoneValid) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const captchaToken = captcha.token;
        captcha.reset();
        await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION, captchaToken);
        setOtp('');
        setStep('otp');
        timer.start();
        notifyOtpSent(t('auth.otpSentToPhone'), 'quick-enroll-otp');
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitOtp() {
    if (name.trim().length < 2) {
      setError(t('auth.enterFullName'));
      return;
    }
    if (!legal) {
      setError(t('legal.documentsUnavailable'));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await verifyPhoneOtp(fullPhone, otp, OtpType.REGISTER_PHONE_VERIFICATION);
        await quickJoin({
          phone_number: fullPhone,
          display_name: name.trim(),
          accepted_terms_version: legal.terms,
          accepted_privacy_version: legal.privacy,
        });
        setAuthenticated(true);
        toast.success(t('auth.loginSuccess'), { toastId: 'login-success' });
        onDone();
      } catch (err) {
        failed(err);
      }
    });
  }

  function resend() {
    if (!resendCaptcha.solved) return;
    setError(null);
    startTransition(async () => {
      try {
        const captchaToken = resendCaptcha.token;
        resendCaptcha.reset();
        await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION, captchaToken);
        timer.start();
        notifyOtpSent(t('auth.otpSentToPhone'), 'quick-enroll-otp');
      } catch (err) {
        failed(err);
      }
    });
  }

  function back() {
    setStep('phone');
    setOtp('');
    setError(null);
  }

  return {
    step,
    pending,
    error,
    captcha,
    resendCaptcha,
    phoneNumber,
    setPhoneNumber,
    phoneValid,
    fullPhone,
    country,
    name,
    setName,
    otp,
    setOtp: (v: string) => setOtp(toEnglishDigits(v)),
    timer,
    submitPhone,
    submitOtp,
    resend,
    back,
  };
}
