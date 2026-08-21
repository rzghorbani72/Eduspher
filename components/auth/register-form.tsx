"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useMemo, useEffect } from "react";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "@/components/ui/link";

import {
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  postJson,
  getLegalDocuments,
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { AuthOtpField } from "@/components/auth/auth-otp-field";
import { useStorePath } from "@/components/providers/store-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber, isValidPhoneNumber, toEnglishDigits } from "@/lib/phone-utils";
import { useTranslation } from "@/lib/i18n/hooks";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

type RegisterValues = {
  name: string;
  email?: string;
  phone_number?: string;
  display_name: string;
  password: string;
  confirmed_password: string;
  bio?: string;
};

type Step = "verification" | "form";

interface RegisterFormProps {
  defaultCountryCode?: string;
  primaryVerificationMethod?: "phone" | "email";
}

export const RegisterForm = ({ primaryVerificationMethod = "phone" }: RegisterFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Login sends the identifier it could not find, so signup never asks for it twice.
  const prefilledIdentifier = searchParams.get("identifier") ?? "";
  // Signup does not sign you in, so the page you originally wanted is handed
  // back to login to complete the round trip.
  const redirectParam = searchParams.get("redirect");
  const prefilledIsEmail = prefilledIdentifier.includes("@");
  useAuthContext();
  const buildPath = useStorePath();
  const loginHref = buildPath(
    redirectParam
      ? `/auth/login?redirect=${encodeURIComponent(redirectParam)}`
      : "/auth/login",
  );
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("verification");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(true);
  const [legalVersions, setLegalVersions] = useState<{
    terms: string | null;
    privacy: string | null;
  }>({
    terms: null,
    privacy: null,
  });

  useEffect(() => {
    getLegalDocuments()
      .then((docs) => {
        setLegalVersions({
          terms: docs.find((d) => d.type === "TERMS")?.version ?? null,
          privacy: docs.find((d) => d.type === "PRIVACY")?.version ?? null,
        });
      })
      .catch(() => {
        setLegalVersions({ terms: null, privacy: null });
      });
  }, []);
  const isSubmittingRef = useRef(false);
  const phoneOtpTimer = useOtpTimer();
  const emailOtpTimer = useOtpTimer();

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t("auth.enterFullName")),
          email:
            primaryVerificationMethod === "email"
              ? z.string().email(t("auth.invalidEmail"))
              : z.string().email(t("auth.invalidEmail")).optional().or(z.literal("")),
          phone_number:
            primaryVerificationMethod === "phone"
              ? z.string().min(6, t("auth.invalidPhone"))
              : z.string().min(6, t("auth.invalidPhone")).optional().or(z.literal("")),
          display_name: z.string().min(2, t("auth.displayNameRequired")),
          password: z.string().min(6, t("auth.passwordMinLength")),
          confirmed_password: z.string().min(6, t("auth.passwordMinLength")),
          bio: z.string().max(300, t("auth.maxBioLength")).optional(),
        })
        .refine((v) => v.password === v.confirmed_password, {
          path: ["confirmed_password"],
          message: t("auth.passwordsDoNotMatch"),
        }),
    [t, primaryVerificationMethod]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: prefilledIsEmail ? prefilledIdentifier : "",
      phone_number: prefilledIsEmail ? "" : prefilledIdentifier,
      password: "",
      confirmed_password: "",
      display_name: "",
      bio: "",
    },
  });

  const getInitialCountry = () => getCountryByCode("IR") ?? getDefaultCountry();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry());
  const [phoneNumber, setPhoneNumber] = useState(prefilledIsEmail ? "" : prefilledIdentifier);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const isValidPhone = (phone: string) =>
    isValidPhoneNumber(cleanPhoneNumber(phone, selectedCountry), selectedCountry);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendPhoneOtp = async () => {
    if (!phoneNumber || !isValidPhone(phoneNumber)) {
      setError(t("auth.invalidPhone"));
      return;
    }
    setOtpLoading(true);
    setError(null);
    setMessage(null);
    try {
      const fullPhone = getFullPhoneNumber(cleanPhoneNumber(phoneNumber, selectedCountry), selectedCountry);
      const response = (await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION)) as { otp?: string };
      setPhoneOtpSent(true);
      phoneOtpTimer.start();
      setMessage(
        response?.otp
          ? `${t("auth.otpSentToPhone")}\n\n🔐 Code: ${response.otp}`
          : t("auth.otpSentToPhone")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp.trim()) {
      setError(t("auth.enterOtpFirst"));
      return;
    }
    setOtpLoading(true);
    setError(null);
    setMessage(null);
    try {
      const fullPhone = getFullPhoneNumber(cleanPhoneNumber(phoneNumber, selectedCountry), selectedCountry);
      const result = await verifyPhoneOtp(fullPhone, phoneOtp, OtpType.REGISTER_PHONE_VERIFICATION);
      if (result.success !== false) {
        setPhoneOtpVerified(true);
        setMessage(t("auth.phoneVerified"));
      } else {
        setError(t("auth.invalidOtp"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidOtp"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    const emailVal = getValues("email");
    if (!emailVal || !isValidEmail(emailVal)) {
      setError(t("auth.invalidEmail"));
      return;
    }
    setOtpLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = (await sendEmailOtp(emailVal, OtpType.REGISTER_EMAIL_VERIFICATION)) as { otp?: string };
      setEmailOtpSent(true);
      emailOtpTimer.start();
      setMessage(
        response?.otp
          ? `${t("auth.otpSentToEmail")}\n\n🔐 Code: ${response.otp}`
          : t("auth.otpSentToEmail")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) {
      setError(t("auth.enterOtpFirst"));
      return;
    }
    const emailVal = getValues("email");
    if (!emailVal || !isValidEmail(emailVal)) {
      setError(t("auth.emailRequired"));
      return;
    }
    setOtpLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await verifyEmailOtp(emailVal, emailOtp, OtpType.REGISTER_EMAIL_VERIFICATION);
      if (result.success !== false) {
        setEmailOtpVerified(true);
        setMessage(t("auth.emailVerified"));
      } else {
        setError(t("auth.invalidOtp"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidOtp"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryVerificationMethod === "phone") {
      if (!phoneOtpSent) { await handleSendPhoneOtp(); return; }
      if (!phoneOtpVerified) { setError(t("auth.phoneVerifyFirst")); return; }
    } else {
      if (!emailOtpSent) { await handleSendEmailOtp(); return; }
      if (!emailOtpVerified) { setError(t("auth.emailVerifyFirst")); return; }
    }
    setStep("form");
    setError(null);
    setMessage(null);
  };

  const onFormSubmit = handleSubmit(async (values) => {
    if (isLoading || isSubmittingRef.current) return;
    setIsLoading(true);
    isSubmittingRef.current = true;
    setError(null);
    setMessage(null);
    try {
      const primaryVerified = primaryVerificationMethod === "phone" ? phoneOtpVerified : emailOtpVerified;
      if (!primaryVerified) {
        setError(primaryVerificationMethod === "phone" ? t("auth.phoneVerifyFirst") : t("auth.emailVerifyFirst"));
        return;
      }

      if (!acceptedLegal) {
        setError(t("legal.mustAcceptTerms"));
        return;
      }

      if (!legalVersions.terms || !legalVersions.privacy) {
        setError(t("legal.documentsUnavailable"));
        return;
      }

      const getCookieValue = (name: string) => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : null;
      };

      const academyIdCookie = getCookieValue(env.academyIdCookie);
      const finalAcademyId =
        academyIdCookie ?? (env.defaultAcademyId != null ? String(env.defaultAcademyId) : undefined);

      const userData: {
        name?: string;
        display_name?: string;
        password?: string;
        confirmed_password?: string;
        bio?: string;
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
        display_name: values.display_name,
        password: values.password,
        confirmed_password: values.confirmed_password,
        bio: values.bio,
        role: "USER",
        academy_id: finalAcademyId,
        accepted_terms_version: legalVersions.terms,
        accepted_privacy_version: legalVersions.privacy,
      };

      if (primaryVerificationMethod === "phone") {
        if (!phoneNumber || !isValidPhone(phoneNumber)) {
          setError(t("auth.phoneRequired"));
          return;
        }
        userData.phone_number = getFullPhoneNumber(cleanPhoneNumber(phoneNumber, selectedCountry), selectedCountry);
        userData.phone_otp = phoneOtpVerified && phoneOtp.trim() ? phoneOtp.trim() : undefined;
      } else {
        if (!values.email || !isValidEmail(values.email)) {
          setError(t("auth.emailRequired"));
          return;
        }
        userData.email = values.email;
        userData.email_otp = emailOtpVerified && emailOtp.trim() ? emailOtp.trim() : undefined;
      }

      await postJson("/auth/register", userData);
      setMessage(t("auth.registrationSuccess"));
      setTimeout(() => {
        router.push(loginHref);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unableToCreateAccount"));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  });

  const watchedEmail = watch("email");
  const hasEmail = Boolean(watchedEmail && isValidEmail(watchedEmail));

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

  return (
    <div className="space-y-5">
      {step === "verification" && (
        <form onSubmit={handleVerificationSubmit} className="space-y-5">
          {/* Primary identifier input */}
          {primaryVerificationMethod === "email" ? (
            <div>
              <input
                id="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder={t("auth.enterEmail")}
                className={cn("auth-input", errors.email && "has-error")}
                {...register("email")}
                onChange={(e) => {
                  e.target.value = toEnglishDigits(e.target.value);
                  register("email").onChange(e);
                }}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
          ) : (
            <div>
              <PhoneInput
                id="phone_number"
                lockCountryCode="IR"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value);
                  const cleaned = cleanPhoneNumber(value, selectedCountry);
                  setValue("phone_number", getFullPhoneNumber(cleaned, selectedCountry), { shouldValidate: true });
                }}
                onCountryChange={(country) => {
                  setSelectedCountry(country);
                  if (phoneNumber) {
                    const cleaned = cleanPhoneNumber(phoneNumber, country);
                    setValue("phone_number", getFullPhoneNumber(cleaned, country), { shouldValidate: true });
                  }
                }}
                defaultCountry={selectedCountry}
                placeholder={t("auth.enterPhone")}
                className="auth-phone"
              />
              {errors.phone_number && (
                <p className="mt-1 text-xs text-destructive">{errors.phone_number.message}</p>
              )}
            </div>
          )}

          {/* OTP row */}
          {primaryVerificationMethod === "phone" ? (
            <AuthOtpField
              label={t("auth.phoneOtp")}
              sendLabel={t("auth.sendPhoneOtp")}
              verifyLabel={t("auth.verifyPhoneOtp")}
              value={phoneOtp}
              onChange={(value) => {
                setPhoneOtp(toEnglishDigits(value));
                setError(null);
              }}
              sent={phoneOtpSent}
              verified={phoneOtpVerified}
              loading={otpLoading}
              canSend={Boolean(phoneNumber) && isValidPhone(phoneNumber)}
              canResend={phoneOtpTimer.canResend}
              countdown={phoneOtpTimer.formatted}
              onSend={handleSendPhoneOtp}
              onVerify={handleVerifyPhoneOtp}
            />
          ) : (
            <AuthOtpField
              label={t("auth.emailOtp")}
              sendLabel={t("auth.sendEmailOtp")}
              verifyLabel={t("auth.verifyEmailOtp")}
              value={emailOtp}
              onChange={(value) => {
                setEmailOtp(toEnglishDigits(value));
                setError(null);
              }}
              sent={emailOtpSent}
              verified={emailOtpVerified}
              loading={otpLoading}
              canSend={hasEmail}
              canResend={emailOtpTimer.canResend}
              countdown={emailOtpTimer.formatted}
              onSend={handleSendEmailOtp}
              onVerify={handleVerifyEmailOtp}
            />
          )}

          {errorBlock}
          {messageBlock}

          <button type="submit" className="auth-submit-btn" disabled={isLoading || otpLoading}>
            {(isLoading || otpLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading || otpLoading ? t("auth.processing") : t("auth.continueToForm")}
          </button>
        </form>
      )}

      {step === "form" && (
        <form onSubmit={onFormSubmit} className="space-y-5">
          {/* Verification badge */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/70">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              {primaryVerificationMethod === "phone" ? t("auth.phoneVerified") : t("auth.emailVerified")}
            </div>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              {primaryVerificationMethod === "phone" ? t("auth.verifyEmailLater") : t("auth.verifyPhoneLater")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">{t("account.fullName")}</Label>
              <input
                id="name"
                autoComplete="name"
                placeholder={t("auth.enterFullName")}
                className={cn("auth-input", errors.name && "has-error")}
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("account.displayName")}</Label>
              <input
                id="display_name"
                placeholder={t("account.displayName")}
                className={cn("auth-input", errors.display_name && "has-error")}
                {...register("display_name")}
              />
              {errors.display_name && (
                <p className="mt-1 text-xs text-destructive">{errors.display_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">{t("auth.password")}</Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
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
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("auth.confirmPassword")}</Label>
              <div className="relative">
                <input
                  id="confirmed_password"
                  type={showConfirmPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder={t("auth.confirmPassword")}
                  className={cn("auth-input with-toggle", errors.confirmed_password && "has-error")}
                  {...register("confirmed_password")}
                  onChange={(e) => {
                    e.target.value = toEnglishDigits(e.target.value);
                    register("confirmed_password").onChange(e);
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute bottom-2 left-0 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmed_password && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmed_password.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{t("auth.bioOptional")}</Label>
            <Textarea id="bio" rows={3} className="mt-1" {...register("bio")} />
            {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
          </div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={acceptedLegal}
              onChange={(e) => { setAcceptedLegal(e.target.checked); setError(null); }}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              {t("legal.acceptPrefix")}{" "}
              <a href={buildPath("/terms")} target="_blank" rel="noreferrer" className="underline">
                {t("auth.termsOfService")}
              </a>{" "}
              {t("legal.and")}{" "}
              <a href={buildPath("/privacy")} target="_blank" rel="noreferrer" className="underline">
                {t("legal.privacyPolicy")}
              </a>{" "}
              {t("legal.acceptSuffix")}
            </span>
          </label>

          {errorBlock}
          {messageBlock}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("verification")}
              className="flex flex-1 items-center justify-center rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("auth.backToVerification")}
            </button>
            <button type="submit" className="auth-submit-btn flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("auth.registering") : t("auth.register")}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href={loginHref}
          className="font-medium text-[color:var(--auth-accent)] hover:underline"
        >
          {t("auth.backToLogin")}
        </Link>
      </p>
    </div>
  );
};
