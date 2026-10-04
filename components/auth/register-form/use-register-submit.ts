'use client';

import { postJson, resolveAcademyId } from '@/lib/api/client';
import { ACCOUNT_HOME_PATH } from '@/lib/account-index-path';
import { safeRedirectPath } from '@/lib/auth/redirect-target';
import { getFullPhoneNumber, cleanPhoneNumber } from '@/lib/phone-utils';
import { isValidEmail } from '@/lib/auth/identifier-validation';
import { useTranslation } from '@/lib/i18n/hooks';
import { toast } from 'react-toastify';
import { RegisterValues } from '../_lib/register-form-helpers';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import type { HumanCheckState } from '@/hooks/use-human-check';
import { UseFormHandleSubmit } from 'react-hook-form';
import { CountryCode } from '@/lib/country-codes';

export function useRegisterSubmit({
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
}: {
  acceptedLegal: boolean;
  buildPath: (path: string) => string;
  emailOtp: string;
  emailOtpVerified: boolean;
  handleSubmit: UseFormHandleSubmit<RegisterValues, RegisterValues>;
  isLoading: boolean;
  isSubmittingRef: RefObject<boolean>;
  isValidPhone: (phone: string) => boolean;
  legalVersions: { terms: string | null; privacy: string | null };
  loginCaptcha: HumanCheckState;
  loginHref: string;
  phoneNumber: string;
  phoneOtp: string;
  phoneOtpVerified: boolean;
  primaryVerificationMethod: 'phone' | 'email';
  redirectParam: string | null;
  selectedCountry: CountryCode;
  setAuthenticated: (value: boolean) => void;
  setError: Dispatch<SetStateAction<string | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const signInNewAccount = async (
    identifier: string,
    password: string,
    captchaToken: string,
    academyId?: string,
  ) => {
    try {
      const result = await postJson<{
        phone_verification_required?: boolean;
        password_reset_required?: boolean;
      }>('/auth/public/login', {
        identifier,
        password,
        academy_id: academyId,
        captcha_token: captchaToken,
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
      window.location.href = safeRedirectPath(redirectParam, buildPath(ACCOUNT_HOME_PATH));
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
      await loginCaptcha.run((loginCaptchaToken) =>
        signInNewAccount(
          userData.phone_number ?? userData.email ?? '',
          userData.password ?? '',
          loginCaptchaToken,
          finalAcademyId,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unableToCreateAccount'));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  });

  return { onFormSubmit };
}
