"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, ArrowLeft } from "lucide-react";

import { postJson, sendPhoneOtp, sendEmailOtp, loginByPhoneOtp, loginByEmailOtp } from "@/lib/api/client";
import { env } from "@/lib/env";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useStorePath } from "@/components/providers/store-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber, toEnglishDigits } from "@/lib/phone-utils";
import { useTranslation } from "@/lib/i18n/hooks";
import { OtpType } from "@/lib/constants";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email or phone is required" })
    .min(1, "Email or phone is required"),
  password: z.string({ required_error: "Password is required" }).min(6, "Minimum 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  defaultCountryCode?: string;
}

export const LoginForm = ({ defaultCountryCode }: LoginFormProps) => {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [otpLoginSent, setOtpLoginSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
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

  // OTP gate state (for admin-created accounts with unverified phone)
  const [otpGate, setOtpGate] = useState<{ tempToken: string; maskedPhone: string; phone: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpResending, setOtpResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function finishLogin() {
    setAuthenticated(true);
    const { loadAndMergeCart } = await import("@/app/actions/cart");
    loadAndMergeCart().catch(() => {});
    router.push(buildPath("/courses"));
    router.refresh();
  }

  async function submitOtp() {
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

  async function resendOtp() {
    if (!otpGate) return;
    setOtpResending(true);
    setError(null);
    try {
      await sendPhoneOtp(otpGate.phone, OtpType.REGISTER_PHONE_VERIFICATION);
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
    startTransition(async () => {
      try {
        if (target.channel === "phone") {
          await sendPhoneOtp(target.value, OtpType.LOGIN_BY_PHONE);
        } else {
          await sendEmailOtp(target.value, OtpType.LOGIN_BY_EMAIL);
        }
        setOtpLoginSent(true);
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

        // Academy ids are cuid strings — never coerce to Number.
        const academyIdCookie = getCookieValue(env.academyIdCookie);
        const finalAcademyId =
          academyIdCookie ??
          (env.defaultAcademyId != null ? String(env.defaultAcademyId) : undefined);

        // Students use the public-login endpoint; /auth/login is staff-only
        // (MANAGER/TEACHER) and rejects STUDENT/USER accounts.
        const result = await postJson<any>("/auth/public/login", {
          identifier,
          password: values.password,
          academy_id: finalAcademyId,
        });

        if (result?.phone_verification_required) {
          setOtpGate({ tempToken: result.temp_token, maskedPhone: result.phone, phone: result.full_phone || result.phone });
          return;
        }

        await finishLogin();
      } catch (err) {
        setAuthenticated(false);
        const message = err instanceof Error ? err.message : t("auth.unableToLogin");
        setError(message);
      }
    });
  });

  if (otpGate) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp">{t("auth.otpVerification")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("auth.enterVerificationCode").replace("{phone}", otpGate.maskedPhone)}
          </p>
        </div>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t("auth.otpCodePlaceholder")}
          value={otp}
          onChange={(e) => setOtp(toEnglishDigits(e.target.value))}
          autoFocus
        />
        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setOtpGate(null); setOtp(""); setError(null); }}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            loading={pending}
            onClick={submitOtp}
            disabled={otp.length < 4}
          >
            {pending ? t("auth.signingIn") : t("auth.verifyAndSignIn")}
          </Button>
        </div>
        <button
          type="button"
          className="w-full text-center text-sm text-(--theme-primary) hover:underline"
          onClick={resendOtp}
          disabled={otpResending}
        >
          {otpResending ? `${t("auth.resendOtp")}...` : t("auth.resendOtp")}
        </button>
      </div>
    );
  }

  const identifierBlock = (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setLoginMethod("email");
            setValue("identifier", email);
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            loginMethod === "email"
              ? "border-(--theme-primary) bg-(--theme-primary-subtle) text-(--theme-primary)"
              : "border-slate-200 bg-card  dark:hover:bg-slate-900"
          )}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod("phone");
            if (phoneNumber) {
              const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
              setValue("identifier", getFullPhoneNumber(cleaned, selectedCountry));
            }
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            loginMethod === "phone"
              ? "border-(--theme-primary) bg-(--theme-primary-subtle) text-(--theme-primary)"
              : "border-slate-200 bg-card  dark:hover:bg-slate-900"
          )}
        >
          <Phone className="h-4 w-4" />
          Phone
        </button>
      </div>
      {loginMethod === "email" ? (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-5 w-5 text-muted opacity-60" />
          </div>
          <Input
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
            className="pl-10"
            placeholder="Enter your email"
          />
        </div>
      ) : (
        <PhoneInput
          id="identifier"
          value={phoneNumber}
          onChange={(value) => {
            setPhoneNumber(value);
            const cleaned = cleanPhoneNumber(value, selectedCountry);
            const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
            setValue("identifier", fullPhone);
          }}
          onCountryChange={(country) => {
            setSelectedCountry(country);
            if (phoneNumber) {
              const cleaned = cleanPhoneNumber(phoneNumber, country);
              const fullPhone = getFullPhoneNumber(cleaned, country);
              setValue("identifier", fullPhone);
            }
          }}
          defaultCountry={selectedCountry}
          placeholder="09121234567"
          autoComplete="tel"
        />
      )}
      {authMode === "password" && errors.identifier ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">{errors.identifier.message}</p>
      ) : null}
    </div>
  );

  const errorBlock = error ? (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {error}
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {(["password", "otp"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setAuthMode(m);
              setOtpLoginSent(false);
              setOtp("");
              setError(null);
            }}
            className={cn(
              "rounded-md py-2 text-sm font-medium transition-colors",
              authMode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "password" ? t("auth.loginWithPassword") : t("auth.loginWithOtp")}
          </button>
        ))}
      </div>

      {authMode === "password" ? (
        <form onSubmit={onSubmit} className="space-y-6">
          {identifierBlock}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" dir="ltr" autoComplete="current-password" {...register("password")} onChange={(e) => { e.target.value = toEnglishDigits(e.target.value); register("password").onChange(e); }} />
            {errors.password ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">{errors.password.message}</p>
            ) : null}
          </div>
          {errorBlock}
          <Button type="submit" className="w-full" loading={pending}>
            {pending ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>
      ) : otpLoginSent ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp-login">{t("auth.otpVerification")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("auth.enterVerificationCode").replace("{phone}", resolveOtpTarget()?.value ?? "")}
            </p>
            <Input
              id="otp-login"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={t("auth.otpCodePlaceholder")}
              value={otp}
              onChange={(e) => setOtp(toEnglishDigits(e.target.value))}
              autoFocus
            />
          </div>
          {errorBlock}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setOtpLoginSent(false); setOtp(""); setError(null); }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
            <Button
              type="button"
              className="flex-1"
              loading={pending}
              onClick={verifyLoginOtp}
              disabled={otp.length < 4}
            >
              {pending ? t("auth.signingIn") : t("auth.verifyAndSignIn")}
            </Button>
          </div>
          <button
            type="button"
            className="w-full text-center text-sm text-(--theme-primary) hover:underline"
            onClick={sendLoginOtp}
            disabled={pending}
          >
            {t("auth.resendOtp")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {identifierBlock}
          {errorBlock}
          <Button type="button" className="w-full" loading={pending} onClick={sendLoginOtp}>
            {pending ? t("auth.signingIn") : t("auth.sendLoginCode")}
          </Button>
        </div>
      )}
    </div>
  );
};

