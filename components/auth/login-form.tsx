"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { postJson, sendPhoneOtp, sendEmailOtp, loginByPhoneOtp, loginByEmailOtp } from "@/lib/api/client";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { env } from "@/lib/env";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useStorePath } from "@/components/providers/store-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber, toEnglishDigits } from "@/lib/phone-utils";
import { useTranslation } from "@/lib/i18n/hooks";
import { OtpType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "@/components/ui/link";

type LoginValues = { identifier: string; password: string };

interface LoginFormProps {
  defaultCountryCode?: string;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.5 14.97.5 12 .5A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.3 9.14 4.75 12 4.75Z" />
    </svg>
  );
}

export const LoginForm = ({ defaultCountryCode }: LoginFormProps) => {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [otpLoginSent, setOtpLoginSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);

  const getInitialCountry = () => {
    if (defaultCountryCode) {
      const country = getCountryByCode(defaultCountryCode);
      if (country) return country;
    }
    return getDefaultCountry();
  };
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [otpGate, setOtpGate] = useState<{ tempToken: string; maskedPhone: string; phone: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpResending, setOtpResending] = useState(false);
  const otpGateTimer = useOtpTimer();
  const otpLoginTimer = useOtpTimer();

  const loginSchema = useMemo(
    () =>
      z.object({
        identifier: z.string().min(1, t("auth.identifierRequired")),
        password: z.string().min(6, t("auth.passwordMinLength")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function finishLogin() {
    setAuthenticated(true);
    const { loadAndMergeCart } = await import("@/app/actions/cart");
    loadAndMergeCart().catch(() => {});
    router.push(buildPath("/courses"));
    router.refresh();
  }

  async function submitOtpGate() {
    if (!otpGate) return;
    setError(null);
    startTransition(async () => {
      try {
        await postJson("/auth/confirm-phone", { temp_token: otpGate.tempToken, otp });
        await finishLogin();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
      }
    });
  }

  async function resendOtpGate() {
    if (!otpGate) return;
    setOtpResending(true);
    setError(null);
    setMessage(null);
    try {
      const response = (await sendPhoneOtp(otpGate.phone, OtpType.REGISTER_PHONE_VERIFICATION)) as { otp?: string };
      otpGateTimer.start();
      // TODO: Remove debug OTP display when real SMS provider is integrated
      if (response?.otp) {
        setMessage(`${t("auth.resendOtp")}\n\n🔐 Code: ${response.otp}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
    } finally {
      setOtpResending(false);
    }
  }

  function resolveOtpTarget(): { channel: "phone" | "email"; value: string } | null {
    if (loginMethod === "phone") {
      if (!phoneNumber) return null;
      const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
      return { channel: "phone", value: getFullPhoneNumber(cleaned, selectedCountry) };
    }
    if (!email) return null;
    return { channel: "email", value: email };
  }

  function sendLoginOtp() {
    const target = resolveOtpTarget();
    if (!target) {
      setError(loginMethod === "phone" ? t("auth.phoneRequired") : t("auth.emailRequired"));
      return;
    }
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const response =
          target.channel === "phone"
            ? ((await sendPhoneOtp(target.value, OtpType.LOGIN_BY_PHONE)) as { otp?: string })
            : ((await sendEmailOtp(target.value, OtpType.LOGIN_BY_EMAIL)) as { otp?: string });
        setOtpLoginSent(true);
        otpLoginTimer.start();
        // TODO: Remove debug OTP display when real SMS provider is integrated
        if (response?.otp) {
          const sentKey = target.channel === "phone" ? "auth.otpSentToPhone" : "auth.otpSentToEmail";
          setMessage(`${t(sentKey)}\n\n🔐 Code: ${response.otp}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
      }
    });
  }

  function verifyLoginOtp() {
    const target = resolveOtpTarget();
    if (!target) return;
    setError(null);
    startTransition(async () => {
      try {
        if (target.channel === "phone") {
          await loginByPhoneOtp(target.value, otp);
        } else {
          await loginByEmailOtp(target.value, otp);
        }
        await finishLogin();
      } catch (err) {
        setAuthenticated(false);
        setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
      }
    });
  }

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        let identifier = values.identifier;
        if (loginMethod === "phone" && phoneNumber) {
          const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
          identifier = getFullPhoneNumber(cleaned, selectedCountry);
        } else if (loginMethod === "email" && email) {
          identifier = email;
        }

        const getCookieValue = (name: string) => {
          if (typeof document === "undefined") return null;
          const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
          return match ? decodeURIComponent(match[1]) : null;
        };

        const academyIdCookie = getCookieValue(env.academyIdCookie);
        const finalAcademyId =
          academyIdCookie ??
          (env.defaultAcademyId != null ? String(env.defaultAcademyId) : undefined);

        const result = await postJson<{
          phone_verification_required?: boolean;
          temp_token?: string;
          phone?: string;
          full_phone?: string;
        }>("/auth/public/login", {
          identifier,
          password: values.password,
          academy_id: finalAcademyId,
        });

        if (result?.phone_verification_required) {
          setOtpGate({
            tempToken: result.temp_token ?? "",
            maskedPhone: result.phone ?? "",
            phone: result.full_phone || result.phone || "",
          });
          otpGateTimer.start();
          return;
        }

        await finishLogin();
      } catch (err) {
        setAuthenticated(false);
        setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
      }
    });
  });

  const errorBlock = error ? (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {error}
    </div>
  ) : null;

  const messageBlock =
    message && !error ? (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 whitespace-pre-wrap dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
        {message}
      </div>
    ) : null;

  // ── Phone-verification OTP gate (after password login) ──────────────
  if (otpGate) {
    return (
      <div className="space-y-5">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold">{t("auth.otpVerification")}</p>
          <p className="text-xs text-muted-foreground">
            {t("auth.enterVerificationCode").replace("{phone}", otpGate.maskedPhone)}
          </p>
        </div>
        <Input
          id="otp-gate"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t("auth.otpCodePlaceholder")}
          value={otp}
          onChange={(e) => setOtp(toEnglishDigits(e.target.value))}
          className="text-center"
          autoFocus
        />
        {errorBlock}
        {messageBlock}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setOtpGate(null); setOtp(""); setError(null); setMessage(null); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>
          <button
            type="button"
            className="auth-submit-btn flex-1"
            onClick={submitOtpGate}
            disabled={pending || otp.length < 4}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? t("auth.signingIn") : t("auth.verifyAndSignIn")}
          </button>
        </div>
        <div className="text-center text-sm">
          {otpGateTimer.canResend ? (
            <button
              type="button"
              className="text-[color:var(--auth-accent)] hover:underline disabled:opacity-50"
              onClick={resendOtpGate}
              disabled={otpResending}
            >
              {otpResending ? `${t("auth.resendOtp")}...` : t("auth.resendOtp")}
            </button>
          ) : (
            <span className="tabular-nums text-muted-foreground text-xs">
              {t("auth.resendIn")} {otpGateTimer.formatted}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── OTP login verify step ────────────────────────────────────────────
  if (authMode === "otp" && otpLoginSent) {
    return (
      <div className="space-y-5">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold">{t("auth.otpVerification")}</p>
          <p className="text-xs text-muted-foreground">
            {t("auth.enterVerificationCode").replace("{phone}", resolveOtpTarget()?.value ?? "")}
          </p>
        </div>
        <Input
          id="otp-login"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t("auth.otpCodePlaceholder")}
          value={otp}
          onChange={(e) => setOtp(toEnglishDigits(e.target.value))}
          className="text-center"
          autoFocus
        />
        {errorBlock}
        {messageBlock}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setOtpLoginSent(false); setOtp(""); setError(null); setMessage(null); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>
          <button
            type="button"
            className="auth-submit-btn flex-1"
            onClick={verifyLoginOtp}
            disabled={pending || otp.length < 4}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? t("auth.signingIn") : t("auth.verifyAndSignIn")}
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span />
          {otpLoginTimer.canResend ? (
            <button
              type="button"
              className="text-[color:var(--auth-accent)] hover:underline disabled:opacity-50"
              onClick={() => { sendLoginOtp(); otpLoginTimer.start(); }}
              disabled={pending}
            >
              {t("auth.resendOtp")}
            </button>
          ) : (
            <span className="tabular-nums text-xs text-muted-foreground">
              {t("auth.resendIn")} {otpLoginTimer.formatted}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Main login form ──────────────────────────────────────────────────
  const identifierBlock = (
    <div className="space-y-3">
      {/* Email / Phone switcher — same pill style as mode toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setLoginMethod(m);
              if (m === "email") setValue("identifier", email);
              if (m === "phone" && phoneNumber) {
                const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
                setValue("identifier", getFullPhoneNumber(cleaned, selectedCountry));
              }
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              loginMethod === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "email" ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
            {m === "email" ? t("auth.email") : t("auth.phone")}
          </button>
        ))}
      </div>

      {loginMethod === "email" ? (
        <div>
          <input
            id="identifier"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              const v = toEnglishDigits(e.target.value);
              setEmail(v);
              setValue("identifier", v);
            }}
            placeholder={t("auth.enterEmail")}
            className={cn("auth-input", authMode === "password" && errors.identifier && "has-error")}
          />
          {authMode === "password" && errors.identifier && (
            <p className="mt-1 text-xs text-destructive">{errors.identifier.message}</p>
          )}
        </div>
      ) : (
        <PhoneInput
          id="identifier"
          value={phoneNumber}
          onChange={(value) => {
            setPhoneNumber(value);
            const cleaned = cleanPhoneNumber(value, selectedCountry);
            setValue("identifier", getFullPhoneNumber(cleaned, selectedCountry));
          }}
          onCountryChange={(country) => {
            setSelectedCountry(country);
            if (phoneNumber) {
              const cleaned = cleanPhoneNumber(phoneNumber, country);
              setValue("identifier", getFullPhoneNumber(cleaned, country));
            }
          }}
          defaultCountry={selectedCountry}
          placeholder={t("auth.enterPhone")}
          autoComplete="tel"
          inputClassName="text-center"
        />
      )}
    </div>
  );

  return (
    <div>
      {/* Mode toggle — underline tabs (matches Figma login) */}
      <div className="auth-tabs">
        {(["password", "otp"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setAuthMode(m); setOtpLoginSent(false); setOtp(""); setError(null); setMessage(null); }}
            className={cn("auth-tab", authMode === m && "on")}
          >
            {m === "password" ? t("auth.loginWithPassword") : t("auth.loginWithOtp")}
          </button>
        ))}
      </div>

      {authMode === "password" ? (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {identifierBlock}

          {/* Password field + forgot link */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="current-password"
                placeholder={t("auth.password")}
                className={cn("auth-input with-toggle", errors.password && "has-error")}
                {...register("password")}
                onChange={(e) => {
                  e.target.value = toEnglishDigits(e.target.value);
                  register("password").onChange(e);
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute bottom-2 left-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            <div className="text-start">
              <Link
                href={buildPath("/auth/forgot-password")}
                className="text-xs text-[color:var(--auth-accent)] hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          </div>

          {errorBlock}

          <button type="submit" className="auth-submit-btn" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? t("auth.signingIn") : t("auth.signIn")}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          {identifierBlock}
          {errorBlock}
          <button
            type="button"
            className="auth-submit-btn"
            disabled={pending}
            onClick={sendLoginOtp}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? t("auth.signingIn") : t("auth.sendLoginCode")}
          </button>
        </div>
      )}

      {/* Divider + Google — exact admin layout */}
      <div className="mt-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("auth.orContinueWith")}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => alert(t("auth.googleSoon"))}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-[color:var(--auth-card-bg)] text-sm font-medium text-[color:var(--auth-card-ink)] transition-colors hover:bg-muted"
        >
          <GoogleIcon className="h-4 w-4" />
          {t("auth.continueWithGoogle")}
        </button>
      </div>

      {/* Sign-up link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.dontHaveAccountYet")}{" "}
        <Link
          href={buildPath("/auth/register")}
          className="font-semibold text-[color:var(--auth-accent)] hover:underline"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </div>
  );
};
