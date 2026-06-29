"use client";

import { useState } from "react";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { useRouter } from "next/navigation";
import Link from "@/components/ui/link";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import {
  validatePhoneAndEmail,
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  forgetPassword,
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { PhoneInput } from "@/components/ui/phone-input";
import { useStorePath } from "@/components/providers/store-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber, toEnglishDigits } from "@/lib/phone-utils";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ""));

type Step = "identifier" | "otp" | "password" | "success";

interface ForgotPasswordFormProps {
  defaultCountryCode?: string;
}

export const ForgotPasswordForm = ({ defaultCountryCode }: ForgotPasswordFormProps) => {
  const router = useRouter();
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("identifier");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const otpTimer = useOtpTimer();

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

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    confirmed_password: "",
    otp: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: toEnglishDigits(value) }));
    setError(null);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const cleaned = cleanPhoneNumber(value, selectedCountry);
    setFormData((prev) => ({ ...prev, identifier: getFullPhoneNumber(cleaned, selectedCountry) }));
    setError(null);
  };

  const handleEmailChange = (value: string) => {
    const v = toEnglishDigits(value);
    setEmail(v);
    setFormData((prev) => ({ ...prev, identifier: v }));
    setError(null);
  };

  const validateIdentifier = () => {
    if (!formData.identifier.trim()) { setError(t("auth.identifierRequired")); return false; }
    if (authMethod === "email" && !isValidEmail(formData.identifier)) { setError(t("auth.invalidEmail")); return false; }
    if (authMethod === "phone" && !isValidPhone(formData.identifier)) { setError(t("auth.invalidPhone")); return false; }
    return true;
  };

  const validatePassword = () => {
    if (!formData.password.trim()) { setError(t("auth.passwordRequired")); return false; }
    if (formData.password.length < 6) { setError(t("auth.passwordTooShort")); return false; }
    if (formData.password !== formData.confirmed_password) { setError(t("auth.passwordsDoNotMatch")); return false; }
    return true;
  };

  const handleValidate = async () => {
    if (!validateIdentifier()) return;
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const phone = authMethod === "phone" ? formData.identifier : undefined;
      const emailVal = authMethod === "email" ? formData.identifier : undefined;
      await validatePhoneAndEmail(phone, emailVal);
      setValidated(true);
      setMessage(t("auth.accountFound"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidPhone"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!validated) { await handleValidate(); return; }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (authMethod === "email") {
        const response = await sendEmailOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_EMAIL) as { otp?: string };
        setMessage(response?.otp ? `${t("auth.otpSentToEmail")}\n\n🔐 Code: ${response.otp}` : t("auth.otpSentToEmail"));
      } else {
        const response = await sendPhoneOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_PHONE) as { otp?: string };
        setMessage(response?.otp ? `${t("auth.otpSentToPhone")}\n\n🔐 Code: ${response.otp}` : t("auth.otpSentToPhone"));
      }
      setStep("otp");
      otpTimer.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) { setError(t("auth.enterOtpFirst")); return; }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (authMethod === "email") {
        await verifyEmailOtp(formData.identifier, formData.otp, OtpType.RESET_PASSWORD_BY_EMAIL);
      } else {
        await verifyPhoneOtp(formData.identifier, formData.otp, OtpType.RESET_PASSWORD_BY_PHONE);
      }
      setStep("password");
      setMessage(t("auth.otpVerifiedSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalidOtp"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await forgetPassword({
        identifier: formData.identifier,
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp,
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unableToLogin"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("identifier");
    setFormData({ identifier: "", password: "", confirmed_password: "", otp: "" });
    setPhoneNumber("");
    setEmail("");
    setValidated(false);
    setError(null);
    setMessage(null);
  };

  const errorBlock = error && (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
      {error}
    </div>
  );

  const messageBlock = message && !error && (
    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 whitespace-pre-wrap dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
      {message}
    </div>
  );

  return (
    <div className="space-y-5">
      {step === "identifier" && (
        <div className="space-y-5">
          {/* Method switcher — same pill style as login form */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["email", "phone"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setAuthMethod(m);
                  setError(null);
                  setValidated(false);
                  if (m === "email" && email) setFormData((prev) => ({ ...prev, identifier: email }));
                  else if (m === "phone" && phoneNumber) {
                    const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
                    setFormData((prev) => ({ ...prev, identifier: getFullPhoneNumber(cleaned, selectedCountry) }));
                  }
                }}
                className={cn(
                  "rounded-md py-1.5 text-xs font-medium transition-colors",
                  authMethod === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "email" ? t("auth.email") : t("auth.phone")}
              </button>
            ))}
          </div>

          {authMethod === "email" ? (
            <input
              id="identifier"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder={t("auth.enterEmail")}
              className="auth-input"
            />
          ) : (
            <PhoneInput
              id="identifier"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onCountryChange={(country) => {
                setSelectedCountry(country);
                if (phoneNumber) {
                  const cleaned = cleanPhoneNumber(phoneNumber, country);
                  setFormData((prev) => ({ ...prev, identifier: getFullPhoneNumber(cleaned, country) }));
                }
              }}
              defaultCountry={selectedCountry}
              placeholder={t("auth.enterPhone")}
              autoComplete="tel"
            />
          )}

          {errorBlock}
          {messageBlock}

          {!validated ? (
            <button type="button" className="auth-submit-btn" onClick={handleValidate} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("auth.validating") : t("auth.validate")}
            </button>
          ) : (
            <button type="button" className="auth-submit-btn" onClick={handleSendOtp} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("auth.sending") : t("auth.sendOtp")}
            </button>
          )}
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder={t("auth.otpCodePlaceholder")}
            value={formData.otp}
            onChange={(e) => handleInputChange("otp", e.target.value)}
            maxLength={6}
            autoComplete="one-time-code"
            className="auth-input"
            autoFocus
          />

          {errorBlock}
          {messageBlock}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("identifier")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </button>
            <button
              type="button"
              className="auth-submit-btn flex-1"
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("auth.verifying") : t("auth.verifyOtp")}
            </button>
          </div>

          <div className="text-center">
            {otpTimer.canResend ? (
              <button
                type="button"
                className="text-sm text-(--auth-accent) hover:underline"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {t("auth.resendOtp")}
              </button>
            ) : (
              <p className="tabular-nums text-xs text-muted-foreground">
                {t("auth.resendIn")} {otpTimer.formatted}
              </p>
            )}
          </div>
        </div>
      )}

      {step === "password" && (
        <div className="space-y-5">
          {messageBlock}

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.enterNewPassword")}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="auth-input with-toggle"
              autoComplete="new-password"
              dir="ltr"
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

          <div className="relative">
            <input
              id="confirmed_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("auth.confirmNewPasswordPlaceholder")}
              value={formData.confirmed_password}
              onChange={(e) => handleInputChange("confirmed_password", e.target.value)}
              className="auth-input with-toggle"
              autoComplete="new-password"
              dir="ltr"
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

          {errorBlock}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("otp")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </button>
            <button
              type="button"
              className="auth-submit-btn flex-1"
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("auth.resetting") : t("auth.resetPassword")}
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("auth.passwordResetSuccess")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("auth.passwordResetDesc")}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex flex-1 items-center justify-center rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("auth.resetAnotherPassword")}
            </button>
            <button
              type="button"
              className="auth-submit-btn flex-1"
              onClick={() => router.push(buildPath("/auth/login"))}
            >
              {t("auth.goToLogin")}
            </button>
          </div>
        </div>
      )}

      {errorBlock}
      {messageBlock}

      <div className="text-center text-sm">
        <Link
          href={buildPath("/auth/login")}
          className="font-semibold text-(--auth-accent) hover:underline"
        >
          {t("auth.backToLogin")}
        </Link>
      </div>
    </div>
  );
};
