'use client';

import { RegisterDetailsStep } from '@/components/auth/register-details-step';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction, JSX } from 'react';
import type { HumanCheckState } from '@/hooks/use-human-check';
import { RegisterValues, Step } from '../_lib/register-form-helpers';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';

export function RegisterDetailsPanel({
  acceptedLegal,
  buildPath,
  errorBlock,
  errors,
  isLoading,
  loginCaptcha,
  onFormSubmit,
  primaryVerificationMethod,
  register,
  setAcceptedLegal,
  setError,
  setStep,
  watch,
}: {
  acceptedLegal: boolean;
  buildPath: (path: string) => string;
  errorBlock: JSX.Element | null;
  errors: FieldErrors<RegisterValues>;
  isLoading: boolean;
  loginCaptcha: HumanCheckState;
  onFormSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  primaryVerificationMethod: 'phone' | 'email';
  register: UseFormRegister<RegisterValues>;
  setAcceptedLegal: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setStep: Dispatch<SetStateAction<Step>>;
  watch: UseFormWatch<RegisterValues>;
}) {
  const { t } = useTranslation();
  return (
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
        primaryVerificationMethod === 'phone' ? t('auth.phoneVerified') : t('auth.emailVerified')
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
      captcha={loginCaptcha}
      onBack={() => setStep('verification')}
      onSubmit={onFormSubmit}
    />
  );
}
