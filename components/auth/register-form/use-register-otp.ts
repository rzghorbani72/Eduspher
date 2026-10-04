'use client';

import { sendEmailOtp, sendPhoneOtp, verifyEmailOtp, verifyPhoneOtp } from '@/lib/api/client';
import { OtpType } from '@/lib/constants';
import { getFullPhoneNumber, cleanPhoneNumber } from '@/lib/phone-utils';
import { isValidEmail } from '@/lib/auth/identifier-validation';
import { useTranslation } from '@/lib/i18n/hooks';
import { toast } from 'react-toastify';
import { RegisterValues, Step } from '../_lib/register-form-helpers';
import type { Dispatch, SetStateAction } from 'react';
import type { HumanCheckState } from '@/hooks/use-human-check';
import { UseFormGetValues } from 'react-hook-form';
import { CountryCode } from '@/lib/country-codes';

export function useRegisterOtp({
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
}: {
  captcha: HumanCheckState;
  emailOtp: string;
  emailOtpTimer: { formatted: string; canResend: boolean; start: () => void };
  getValues: UseFormGetValues<RegisterValues>;
  isValidPhone: (phone: string) => boolean;
  notifyOtpSent: (message: string, toastId?: string) => void;
  phoneNumber: string;
  phoneOtp: string;
  phoneOtpTimer: { formatted: string; canResend: boolean; start: () => void };
  selectedCountry: CountryCode;
  setEmailOtp: Dispatch<SetStateAction<string>>;
  setEmailOtpSent: Dispatch<SetStateAction<boolean>>;
  setEmailOtpVerified: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setOtpLoading: Dispatch<SetStateAction<boolean>>;
  setPhoneOtp: Dispatch<SetStateAction<string>>;
  setPhoneOtpSent: Dispatch<SetStateAction<boolean>>;
  setPhoneOtpVerified: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<Step>>;
}) {
  const { t } = useTranslation();
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
      await captcha.run((captchaToken) =>
        sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION, captchaToken),
      );
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
        setStep('form');
        setError(null);
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
      await captcha.run((captchaToken) =>
        sendEmailOtp(emailVal, OtpType.REGISTER_EMAIL_VERIFICATION, captchaToken),
      );
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
        setStep('form');
        setError(null);
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

  return {
    changeContact,
    handleSendEmailOtp,
    handleSendPhoneOtp,
    handleVerifyEmailOtp,
    handleVerifyPhoneOtp,
  };
}
