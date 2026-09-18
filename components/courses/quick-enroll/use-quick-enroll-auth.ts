'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'react-toastify';

import {
  getLegalDocuments,
  identifyAccount,
  loginByPhoneOtp,
  quickJoin,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '@/lib/api/client';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';
import { useAuthContext } from '@/components/providers/auth-provider';
import { OtpType } from '@/lib/constants';
import { isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { getDefaultCountry } from '@/lib/country-codes';
import { cleanPhoneNumber, getFullPhoneNumber, toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';

export type QuickEnrollStep = 'phone' | 'otp';
/** Decided by the account lookup: a member signs in, a stranger joins. */
type Mode = 'login' | 'register';

type LegalVersions = { terms: string; privacy: string } | null;

/**
 * Phone-only sign-in/sign-up for the enroll dialog. One phone box, one code
 * box; the lookup decides whether the code logs a member in or creates the
 * student's membership here. `onDone` fires once a session cookie is set.
 */
export function useQuickEnrollAuth(onDone: () => void) {
  const { t } = useTranslation();
  const { setAuthenticated } = useAuthContext();
  const notifyOtpSent = useOtpNotifier();
  const timer = useOtpTimer();
  const country = getDefaultCountry();

  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<QuickEnrollStep>('phone');
  const [mode, setMode] = useState<Mode>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [passwordOnly, setPasswordOnly] = useState(false);
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

  const sendCode = async (next: Mode) => {
    await sendPhoneOtp(
      fullPhone,
      next === 'login' ? OtpType.LOGIN_BY_PHONE : OtpType.REGISTER_PHONE_VERIFICATION,
    );
    setMode(next);
    setOtp('');
    setStep('otp');
    timer.start();
    notifyOtpSent(t('auth.otpSentToPhone'), 'quick-enroll-otp');
  };

  function submitPhone() {
    if (!phoneValid) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setError(null);
    setPasswordOnly(false);
    startTransition(async () => {
      try {
        const identity = await identifyAccount(fullPhone);
        if (!identity.exists) {
          await sendCode('register');
          return;
        }
        if (!identity.can_use_otp) {
          setPasswordOnly(true);
          return;
        }
        await sendCode('login');
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitOtp() {
    if (mode === 'register' && name.trim().length < 2) {
      setError(t('auth.enterFullName'));
      return;
    }
    if (mode === 'register' && !legal) {
      setError(t('legal.documentsUnavailable'));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (mode === 'login') {
          await loginByPhoneOtp(fullPhone, otp);
        } else if (legal) {
          await verifyPhoneOtp(fullPhone, otp, OtpType.REGISTER_PHONE_VERIFICATION);
          await quickJoin({
            phone_number: fullPhone,
            display_name: name.trim(),
            accepted_terms_version: legal.terms,
            accepted_privacy_version: legal.privacy,
          });
        }
        setAuthenticated(true);
        toast.success(t('auth.loginSuccess'), { toastId: 'login-success' });
        onDone();
      } catch (err) {
        failed(err);
      }
    });
  }

  function resend() {
    setError(null);
    startTransition(async () => {
      try {
        await sendCode(mode);
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
    mode,
    pending,
    error,
    passwordOnly,
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
