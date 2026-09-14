'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';

import {
  identifyAccount,
  isCaptchaRequiredError,
  loginByEmailOtp,
  loginByPhoneOtp,
  postJson,
  resolveAcademyId,
  sendEmailOtp,
  sendPhoneOtp,
  type AccountIdentity,
} from '@/lib/api/client';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';
import { isPasswordValid } from '@/lib/password-utils';
import { nextStepFor } from '@/lib/auth-identify';
import { isValidEmail, isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { safeRedirectPath } from '@/lib/auth/redirect-target';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useStorePath } from '@/components/providers/store-provider';
import { getDefaultCountry } from '@/lib/country-codes';
import { getFullPhoneNumber, cleanPhoneNumber, toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { OtpType } from '@/lib/constants';

export type LoginChannel = 'email' | 'phone';
export type LoginStep = 'identify' | 'password' | 'otpLogin' | 'otpGate' | 'passwordReset';

/**
 * Identifier-first sign-in for an academy site: look the account up first, then
 * show only the method it really has. Same rule as the panel — see
 * `lib/auth-identify.ts`.
 */
export function useLogin() {
  const searchParams = useSearchParams();
  const { setAuthenticated } = useAuthContext();
  const buildPath = useStorePath();
  const { t } = useTranslation();

  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<LoginStep>('identify');
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [channel, setChannel] = useState<LoginChannel>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // v1 is Iran-only: the dial code is fixed, never picked by the visitor.
  const country = getDefaultCountry();
  const [password, setPassword] = useState('');
  // Shown only after repeated failures — the API demands a token from then on.
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const [otp, setOtp] = useState('');
  const [otpGate, setOtpGate] = useState<{
    tempToken: string;
    maskedPhone: string;
    phone: string;
  } | null>(null);
  const [otpResending, setOtpResending] = useState(false);
  const notifyOtpSent = useOtpNotifier();
  const otpGateTimer = useOtpTimer();
  const otpLoginTimer = useOtpTimer();

  // Admin created this account with a one-time password — the user must pick
  // their own before a real session is granted.
  const [resetTempToken, setResetTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const identifier =
    channel === 'phone'
      ? phoneNumber
        ? getFullPhoneNumber(cleanPhoneNumber(phoneNumber, country), country)
        : ''
      : email.trim();

  // The identifier is only judged once it is complete, so the button turns on
  // exactly when a whole phone number (or email) has been typed.
  const identifierValid =
    channel === 'phone' ? isValidPhoneInput(phoneNumber, country) : isValidEmail(email);

  function clearFeedback() {
    setError(null);
  }

  async function finishLogin() {
    setAuthenticated(true);
    const { loadAndMergeCart } = await import('@/app/actions/cart');
    loadAndMergeCart().catch(() => {});
    toast.success(t('auth.loginSuccess'), { toastId: 'login-success' });
    // Hard navigation: the account layout re-checks auth server-side on every
    // navigation, and a client-side router.push can race the cookie write and
    // bounce back to the first login step. A full reload always sees the
    // committed cookie (same fix as AdminPanel's use-delayed-redirect.ts).
    window.location.href = safeRedirectPath(searchParams.get('redirect'), buildPath('/'));
  }

  function failed(err: unknown) {
    if (isCaptchaRequiredError(err)) setCaptchaRequired(true);
    setCaptchaToken('');
    setError(err instanceof Error ? err.message : t('auth.unableToLogin'));
  }

  function showSentCode(sentKey: string) {
    notifyOtpSent(t(sentKey), 'login-otp');
  }

  function sendLoginOtp() {
    if (!identifier) return;
    clearFeedback();
    startTransition(async () => {
      try {
        if (channel === 'phone') {
          await sendPhoneOtp(identifier, OtpType.LOGIN_BY_PHONE);
        } else {
          await sendEmailOtp(identifier, OtpType.LOGIN_BY_EMAIL);
        }
        setOtp('');
        setStep('otpLogin');
        otpLoginTimer.start();
        showSentCode(channel === 'phone' ? 'auth.otpSentToPhone' : 'auth.otpSentToEmail');
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitIdentify() {
    if (!identifier) {
      setError(channel === 'phone' ? t('auth.phoneRequired') : t('auth.emailRequired'));
      return;
    }
    clearFeedback();
    setNotRegistered(false);
    startTransition(async () => {
      try {
        const result = await identifyAccount(identifier, captchaToken || undefined);
        setCaptchaRequired(result.captcha_required);
        setCaptchaToken('');
        const next = nextStepFor(result);
        // "member_elsewhere" cannot happen on an academy site (the lookup is
        // already scoped to this academy), but it means "no account here" all
        // the same, so it must never fall through to a password box.
        if (next === 'register' || next === 'member_elsewhere') {
          setNotRegistered(true);
          return;
        }
        if (next === 'panel_blocked') {
          setError(t('auth.noSignInMethodAvailable'));
          return;
        }
        setIdentity(result);
        if (next === 'otp') {
          sendLoginOtp();
          return;
        }
        if (next === 'blocked') {
          setError(t('auth.noSignInMethodAvailable'));
          return;
        }
        setStep('password');
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitPassword() {
    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        const academyId = resolveAcademyId() ?? undefined;

        const result = await postJson<{
          phone_verification_required?: boolean;
          password_reset_required?: boolean;
          temp_token?: string;
          phone?: string;
          full_phone?: string;
        }>('/auth/public/login', {
          identifier,
          password,
          academy_id: academyId,
          ...(captchaToken ? { captcha_token: captchaToken } : {}),
        });

        if (result?.phone_verification_required) {
          setOtpGate({
            tempToken: result.temp_token ?? '',
            maskedPhone: result.phone ?? '',
            phone: result.full_phone || result.phone || '',
          });
          setOtp('');
          setStep('otpGate');
          otpGateTimer.start();
          return;
        }
        if (result?.password_reset_required) {
          setResetTempToken(result.temp_token ?? '');
          setStep('passwordReset');
          return;
        }
        await finishLogin();
      } catch (err) {
        setAuthenticated(false);
        failed(err);
      }
    });
  }

  function submitOtp() {
    clearFeedback();
    startTransition(async () => {
      try {
        if (step === 'otpGate') {
          const result = await postJson<{
            password_reset_required?: boolean;
            temp_token?: string;
          }>('/auth/confirm-phone', {
            temp_token: otpGate?.tempToken ?? '',
            otp,
          });
          if (result?.password_reset_required) {
            setResetTempToken(result.temp_token ?? '');
            setStep('passwordReset');
            return;
          }
        } else if (channel === 'phone') {
          await loginByPhoneOtp(identifier, otp);
        } else {
          await loginByEmailOtp(identifier, otp);
        }
        await finishLogin();
      } catch (err) {
        setAuthenticated(false);
        failed(err);
      }
    });
  }

  function submitNewPassword() {
    if (!isPasswordValid(newPassword)) {
      setError(t('auth.passwordTooWeak'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        await postJson('/auth/set-new-password', {
          temp_token: resetTempToken,
          new_password: newPassword,
        });
        await finishLogin();
      } catch (err) {
        setAuthenticated(false);
        failed(err);
      }
    });
  }

  async function resendOtp() {
    if (step === 'otpLogin') {
      sendLoginOtp();
      otpLoginTimer.start();
      return;
    }
    if (!otpGate) return;
    setOtpResending(true);
    clearFeedback();
    try {
      await sendPhoneOtp(otpGate.phone, OtpType.REGISTER_PHONE_VERIFICATION);
      otpGateTimer.start();
      showSentCode('auth.resendOtp');
    } catch (err) {
      failed(err);
    } finally {
      setOtpResending(false);
    }
  }

  function changeIdentifier() {
    setStep('identify');
    setIdentity(null);
    setPassword('');
    setOtp('');
    setOtpGate(null);
    clearFeedback();
  }

  function changeChannel(next: LoginChannel) {
    setChannel(next);
    setNotRegistered(false);
    clearFeedback();
  }

  return {
    t,
    buildPath,
    // Kept so a detour through signup still ends on the page the visitor wanted.
    redirectParam: searchParams.get('redirect'),
    step,
    pending,
    error,
    notRegistered,
    captchaRequired,
    setCaptchaToken,
    canUseOtp: identity?.can_use_otp ?? false,
    channel,
    changeChannel,
    email,
    setEmail: (v: string) => setEmail(toEnglishDigits(v)),
    phoneNumber,
    setPhoneNumber,
    country,
    identifier,
    identifierValid,
    password,
    setPassword: (v: string) => setPassword(toEnglishDigits(v)),
    otp,
    setOtp: (v: string) => setOtp(toEnglishDigits(v)),
    otpTarget: step === 'otpGate' ? (otpGate?.maskedPhone ?? '') : identifier,
    otpResending,
    otpTimer: step === 'otpGate' ? otpGateTimer : otpLoginTimer,
    submitIdentify,
    submitPassword,
    submitOtp,
    resendOtp,
    useOtpInstead: sendLoginOtp,
    changeIdentifier,

    newPassword,
    setNewPassword: (v: string) => setNewPassword(toEnglishDigits(v)),
    confirmNewPassword,
    setConfirmNewPassword: (v: string) => setConfirmNewPassword(toEnglishDigits(v)),
    submitNewPassword,
  };
}
