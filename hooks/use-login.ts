'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'react-toastify';

import {
  apiErrorCode,
  loginByPhoneOtp,
  postJson,
  resolveAcademyId,
  sendPhoneOtp,
} from '@/lib/api/client';
import { useOtpTimer } from '@/hooks/use-otp-timer';
import { useOtpNotifier } from '@/hooks/use-otp-notifier';
import { useHumanCheck } from '@/hooks/use-human-check';
import { ACCOUNT_HOME_PATH } from '@/lib/account-index-path';
import { isPasswordValid } from '@/lib/password-utils';
import {
  clearAuthIdentifierDraft,
  readAuthIdentifierDraft,
  writeAuthIdentifierDraft,
} from '@/lib/auth/auth-identifier-draft';
import { isValidPhoneInput } from '@/lib/auth/identifier-validation';
import { safeRedirectPath } from '@/lib/auth/redirect-target';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useStorePath } from '@/components/providers/store-provider';
import { getDefaultCountry } from '@/lib/country-codes';
import {
  getFullPhoneNumber,
  cleanPhoneNumber,
  toEnglishDigits,
  toLocalPhoneNumber,
} from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { OtpType } from '@/lib/constants';

export type LoginMethod = 'password' | 'otp';
export type LoginStep = 'form' | 'otpLogin' | 'otpGate' | 'passwordReset';

function phoneFromQuery(raw: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value) return '';
  return toLocalPhoneNumber(value, getDefaultCountry()) || value.replace(/\D/g, '');
}

/**
 * One-step sign-in for an academy site: identifier, method (password or
 * one-time code) and a human check, all on the first screen. An unknown
 * account is routed to signup only once it is actually tried — the captcha
 * being solved is what makes that answer safe to give.
 */
export function useLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthenticated, setHeaderUser } = useAuthContext();
  const buildPath = useStorePath();
  const { t } = useTranslation();

  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<LoginStep>('form');
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<LoginMethod>('password');
  const [phoneNumber, setPhoneNumber] = useState(() =>
    phoneFromQuery(searchParams.get('identifier')),
  );
  const [draftReady, setDraftReady] = useState(false);
  // v1 is Iran-only: the dial code is fixed, never picked by the visitor.
  const country = getDefaultCountry();
  const [password, setPassword] = useState('');
  const captcha = useHumanCheck();

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
  const resendCaptcha = useHumanCheck();

  // Admin created this account with a one-time password — the user must pick
  // their own before a real session is granted.
  const [resetTempToken, setResetTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Fill any gaps from the last auth screen (e.g. typed phone, then opened forgot).
  useEffect(() => {
    const draft = readAuthIdentifierDraft();
    if (draft) setPhoneNumber((prev) => prev || draft.phone);
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    writeAuthIdentifierDraft({ phone: phoneNumber, channel: 'phone' });
  }, [phoneNumber, draftReady]);

  const identifier = phoneNumber
    ? getFullPhoneNumber(cleanPhoneNumber(phoneNumber, country), country)
    : '';
  const displayIdentifier = toLocalPhoneNumber(identifier, country);

  // Only judged once complete, so the button turns on exactly when a whole number is typed.
  const identifierValid = isValidPhoneInput(phoneNumber, country);
  const canSubmit = identifierValid && (method === 'otp' || password.length >= 6) && captcha.solved;

  function clearFeedback() {
    setError(null);
  }

  async function finishLogin() {
    clearAuthIdentifierDraft();
    setAuthenticated(true);
    try {
      const { getHeaderUser } = await import('@/app/actions/auth');
      const user = await getHeaderUser();
      setHeaderUser({ displayName: user.displayName, avatarUrl: user.avatarUrl });
    } catch {
      // Name loads after redirect if this fails.
    }
    const { loadAndMergeCart } = await import('@/app/actions/cart');
    loadAndMergeCart().catch(() => {});
    toast.success(t('auth.loginSuccess'), { toastId: 'login-success' });
    // Hard navigation: the account layout re-checks auth server-side on every
    // navigation, and a client-side router.push can race the cookie write and
    // bounce back to the first login step. A full reload always sees the
    // committed cookie (same fix as AdminPanel's use-delayed-redirect.ts).
    window.location.href = safeRedirectPath(
      searchParams.get('redirect'),
      buildPath(ACCOUNT_HOME_PATH),
    );
  }

  // No account yet: carry the typed identifier into signup so it is verified
  // there, then name + password — the visitor never types it twice.
  function goToRegister() {
    writeAuthIdentifierDraft({ phone: phoneNumber, channel: 'phone' });
    const query = new URLSearchParams({ identifier: displayIdentifier });
    const redirect = searchParams.get('redirect');
    if (redirect) query.set('redirect', redirect);
    toast.info(t('auth.accountNotRegisteredForLogin'), { toastId: 'login-register' });
    router.push(buildPath(`/auth/register?${query}`));
  }

  function failed(err: unknown) {
    captcha.reset();
    if (apiErrorCode(err) === 'AUTH_USER_NOT_REGISTERED') {
      goToRegister();
      return;
    }
    setError(err instanceof Error ? err.message : t('auth.unableToLogin'));
  }

  function showSentCode(sentKey: string) {
    notifyOtpSent(t(sentKey), 'login-otp');
  }

  function sendLoginOtp(captchaToken: string) {
    if (!identifier) return;
    clearFeedback();
    startTransition(async () => {
      try {
        await sendPhoneOtp(identifier, OtpType.LOGIN_BY_PHONE, captchaToken);
        setOtp('');
        setStep('otpLogin');
        otpLoginTimer.start();
        showSentCode('auth.otpSentToPhone');
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitPassword(captchaToken: string) {
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
          captcha_token: captchaToken,
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier) {
      setError(t('auth.phoneRequired'));
      return;
    }
    if (method === 'password' && password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    const captchaToken = captcha.token;
    captcha.reset();
    if (method === 'otp') {
      sendLoginOtp(captchaToken);
    } else {
      submitPassword(captchaToken);
    }
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
        } else {
          await loginByPhoneOtp(identifier, otp);
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

  // Every resend is a new anonymous SMS, so it needs its own captcha widget.
  async function resendOtp() {
    const captchaToken = resendCaptcha.token;
    resendCaptcha.reset();
    if (step === 'otpLogin') {
      sendLoginOtp(captchaToken);
      otpLoginTimer.start();
      return;
    }
    if (!otpGate) return;
    setOtpResending(true);
    clearFeedback();
    try {
      await sendPhoneOtp(otpGate.phone, OtpType.REGISTER_PHONE_VERIFICATION, captchaToken);
      otpGateTimer.start();
      showSentCode('auth.resendOtp');
    } catch (err) {
      failed(err);
    } finally {
      setOtpResending(false);
    }
  }

  function changeIdentifier() {
    setStep('form');
    setPassword('');
    setOtp('');
    setOtpGate(null);
    clearFeedback();
  }

  function changeMethod(next: LoginMethod) {
    setMethod(next);
    clearFeedback();
  }

  return {
    t,
    buildPath,
    step,
    pending,
    error,
    captcha,
    resendCaptcha,
    method,
    changeMethod,
    phoneNumber,
    setPhoneNumber,
    country,
    identifier,
    displayIdentifier,
    identifierValid,
    canSubmit,
    password,
    setPassword: (v: string) => setPassword(toEnglishDigits(v)),
    otp,
    setOtp: (v: string) => setOtp(toEnglishDigits(v)),
    otpTarget: step === 'otpGate' ? (otpGate?.maskedPhone ?? '') : displayIdentifier,
    otpResending,
    otpTimer: step === 'otpGate' ? otpGateTimer : otpLoginTimer,
    submit,
    submitOtp,
    resendOtp,
    changeIdentifier,

    newPassword,
    setNewPassword: (v: string) => setNewPassword(toEnglishDigits(v)),
    confirmNewPassword,
    setConfirmNewPassword: (v: string) => setConfirmNewPassword(toEnglishDigits(v)),
    submitNewPassword,
  };
}
