"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  identifyAccount,
  isCaptchaRequiredError,
  loginByEmailOtp,
  loginByPhoneOtp,
  postJson,
  sendEmailOtp,
  sendPhoneOtp,
  type AccountIdentity,
} from "@/lib/api/client";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { env } from "@/lib/env";
import { nextStepFor } from "@/lib/auth-identify";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useStorePath } from "@/components/providers/store-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber, toEnglishDigits } from "@/lib/phone-utils";
import { useTranslation } from "@/lib/i18n/hooks";
import { OtpType } from "@/lib/constants";

export type LoginChannel = "email" | "phone";
export type LoginStep = "identify" | "password" | "otpLogin" | "otpGate" | "passwordReset";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Identifier-first sign-in for an academy site: look the account up first, then
 * show only the method it really has. Same rule as the panel — see
 * `lib/auth-identify.ts`.
 */
export function useLogin(defaultCountryCode?: string) {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const buildPath = useStorePath();
  const { t } = useTranslation();

  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<LoginStep>("identify");
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [channel, setChannel] = useState<LoginChannel>("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState<CountryCode>(
    (defaultCountryCode ? getCountryByCode(defaultCountryCode) : null) ?? getDefaultCountry()
  );
  const [password, setPassword] = useState("");
  // Shown only after repeated failures — the API demands a token from then on.
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const [otp, setOtp] = useState("");
  const [otpGate, setOtpGate] = useState<{ tempToken: string; maskedPhone: string; phone: string } | null>(null);
  const [otpResending, setOtpResending] = useState(false);
  const otpGateTimer = useOtpTimer();
  const otpLoginTimer = useOtpTimer();

  // Admin created this account with a one-time password — the user must pick
  // their own before a real session is granted.
  const [resetTempToken, setResetTempToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const identifier =
    channel === "phone"
      ? phoneNumber
        ? getFullPhoneNumber(cleanPhoneNumber(phoneNumber, country), country)
        : ""
      : email.trim();

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  async function finishLogin() {
    setAuthenticated(true);
    const { loadAndMergeCart } = await import("@/app/actions/cart");
    loadAndMergeCart().catch(() => {});
    router.push(buildPath("/courses"));
    router.refresh();
  }

  function failed(err: unknown) {
    if (isCaptchaRequiredError(err)) setCaptchaRequired(true);
    setCaptchaToken("");
    setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
  }

  function showSentCode(response: { otp?: string }, sentKey: string) {
    // TODO: Remove debug OTP display when real SMS provider is integrated
    if (response?.otp) {
      setMessage(`${t(sentKey)}\n\n🔐 Code: ${response.otp}`);
    }
  }

  function sendLoginOtp() {
    if (!identifier) return;
    clearFeedback();
    startTransition(async () => {
      try {
        const response =
          channel === "phone"
            ? ((await sendPhoneOtp(identifier, OtpType.LOGIN_BY_PHONE)) as { otp?: string })
            : ((await sendEmailOtp(identifier, OtpType.LOGIN_BY_EMAIL)) as { otp?: string });
        setOtp("");
        setStep("otpLogin");
        otpLoginTimer.start();
        showSentCode(response, channel === "phone" ? "auth.otpSentToPhone" : "auth.otpSentToEmail");
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitIdentify() {
    if (!identifier) {
      setError(channel === "phone" ? t("auth.phoneRequired") : t("auth.emailRequired"));
      return;
    }
    clearFeedback();
    setNotRegistered(false);
    startTransition(async () => {
      try {
        const result = await identifyAccount(identifier, captchaToken || undefined);
        setCaptchaRequired(result.captcha_required);
        setCaptchaToken("");
        const next = nextStepFor(result);
        if (next === "register") {
          setNotRegistered(true);
          return;
        }
        setIdentity(result);
        if (next === "otp") {
          sendLoginOtp();
          return;
        }
        if (next === "blocked") {
          setError(t("auth.noSignInMethodAvailable"));
          return;
        }
        setStep("password");
      } catch (err) {
        failed(err);
      }
    });
  }

  function submitPassword() {
    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        const academyId =
          readCookie(env.academyIdCookie) ??
          (env.defaultAcademyId != null ? String(env.defaultAcademyId) : undefined);

        const result = await postJson<{
          phone_verification_required?: boolean;
          password_reset_required?: boolean;
          temp_token?: string;
          phone?: string;
          full_phone?: string;
        }>("/auth/public/login", {
          identifier,
          password,
          academy_id: academyId,
          ...(captchaToken ? { captcha_token: captchaToken } : {}),
        });

        if (result?.phone_verification_required) {
          setOtpGate({
            tempToken: result.temp_token ?? "",
            maskedPhone: result.phone ?? "",
            phone: result.full_phone || result.phone || "",
          });
          setOtp("");
          setStep("otpGate");
          otpGateTimer.start();
          return;
        }
        if (result?.password_reset_required) {
          setResetTempToken(result.temp_token ?? "");
          setStep("passwordReset");
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
        if (step === "otpGate") {
          const result = await postJson<{
            password_reset_required?: boolean;
            temp_token?: string;
          }>("/auth/confirm-phone", { temp_token: otpGate?.tempToken ?? "", otp });
          if (result?.password_reset_required) {
            setResetTempToken(result.temp_token ?? "");
            setStep("passwordReset");
            return;
          }
        } else if (channel === "phone") {
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
    if (newPassword.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }
    clearFeedback();
    startTransition(async () => {
      try {
        await postJson("/auth/set-new-password", {
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
    if (step === "otpLogin") {
      sendLoginOtp();
      otpLoginTimer.start();
      return;
    }
    if (!otpGate) return;
    setOtpResending(true);
    clearFeedback();
    try {
      const response = (await sendPhoneOtp(otpGate.phone, OtpType.REGISTER_PHONE_VERIFICATION)) as { otp?: string };
      otpGateTimer.start();
      showSentCode(response, "auth.resendOtp");
    } catch (err) {
      failed(err);
    } finally {
      setOtpResending(false);
    }
  }

  function changeIdentifier() {
    setStep("identify");
    setIdentity(null);
    setPassword("");
    setOtp("");
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
    step,
    pending,
    error,
    message,
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
    setCountry,
    identifier,
    password,
    setPassword: (v: string) => setPassword(toEnglishDigits(v)),
    otp,
    setOtp: (v: string) => setOtp(toEnglishDigits(v)),
    otpTarget: step === "otpGate" ? (otpGate?.maskedPhone ?? "") : identifier,
    otpResending,
    otpTimer: step === "otpGate" ? otpGateTimer : otpLoginTimer,
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
