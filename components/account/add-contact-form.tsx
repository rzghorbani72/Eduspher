"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { OtpBoxInput } from "@/components/ui/otp-box-input";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";
import {
  getDefaultCountry,
  getCountryByCode,
  type CountryCode,
} from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber } from "@/lib/phone-utils";

interface AddContactFormProps {
  method: "email" | "phone";
  primaryMethod: "email" | "phone";
  defaultCountryCode?: string;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

type Translate = (key: string) => string;

const getEmailValidationError = (
  email: string,
  t: Translate,
): string | null => {
  if (!email) return t("auth.emailRequired");
  if (!isValidEmail(email)) return t("account.invalidEmail");
  return null;
};

const getPhoneValidationError = (
  phone: string,
  t: Translate,
): string | null => {
  if (!phone) return t("auth.phoneRequired");
  if (!isValidPhone(phone)) return t("account.invalidPhone");
  return null;
};

export const AddContactForm = ({
  method,
  defaultCountryCode,
  onSuccess,
}: AddContactFormProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<"input" | "otp" | "success">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Email state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Phone state
  const getInitialCountry = () => {
    if (defaultCountryCode) {
      const country = getCountryByCode(defaultCountryCode);
      if (country) return country;
    }
    return getDefaultCountry();
  };
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(getInitialCountry());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // OTP state
  const [otp, setOtp] = useState("");
  const [, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setEmailError(null);
    setPhoneError(null);

    try {
      if (method === "email") {
        if (!email.trim()) {
          setError(t("auth.emailRequired"));
          setEmailError(t("auth.emailRequired"));
          return;
        }
        const emailError = getEmailValidationError(email, t);
        if (emailError) {
          setError(emailError);
          setEmailError(emailError);
          return;
        }
        await sendEmailOtp(email, OtpType.REGISTER_EMAIL_VERIFICATION);
        setMessage(t("auth.otpSentToEmail"));
        setOtpSent(true);
        setStep("otp");
      } else {
        if (!phoneNumber.trim()) {
          setError(t("auth.phoneRequired"));
          setPhoneError(t("auth.phoneRequired"));
          return;
        }
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
        const phoneError = getPhoneValidationError(fullPhone, t);
        if (phoneError) {
          setError(phoneError);
          setPhoneError(phoneError);
          return;
        }
        await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
        setMessage(t("auth.otpSentToPhone"));
        setOtpSent(true);
        setStep("otp");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("account.sendOtpFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError(t("auth.enterOtpFirst"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (method === "email") {
        const result = await verifyEmailOtp(
          email,
          otp,
          OtpType.REGISTER_EMAIL_VERIFICATION,
        );
        if (result.success !== false) {
          setStep("success");
          setMessage(t("account.emailAdded"));
          onSuccess?.();
          setTimeout(() => {
            router.refresh();
          }, 1500);
        } else {
          setError(t("auth.invalidOtp"));
        }
      } else {
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
        const result = await verifyPhoneOtp(
          fullPhone,
          otp,
          OtpType.REGISTER_PHONE_VERIFICATION,
        );
        if (result.success !== false) {
          setStep("success");
          setMessage(t("account.phoneAdded"));
          onSuccess?.();
          setTimeout(() => {
            router.refresh();
          }, 1500);
        } else {
          setError(t("auth.invalidOtp"));
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("auth.invalidOtp");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {method === "email"
              ? t("account.emailAdded")
              : t("account.phoneAdded")}
          </h3>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">{t("auth.otpVerification")}</Label>
          <OtpBoxInput
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
            onComplete={() => {
              if (!isLoading) void handleVerifyOtp();
            }}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 whitespace-pre-wrap dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep("input");
              setOtp("");
              setError(null);
              setMessage(null);
            }}
            className="flex-1"
          >
            {t("common.back")}
          </Button>
          <Button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isLoading || !otp.trim()}
            className="flex-1"
            loading={isLoading}
          >
            {isLoading ? t("auth.verifying") : t("auth.verifyOtp")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {method === "email" ? (
        <div className="space-y-2">
          <Label htmlFor="email">{t("account.email")}</Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <Mail className="size-5 text-muted" aria-hidden="true" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder={t("account.emailPlaceholder")}
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                const error = getEmailValidationError(value, t);
                setEmailError(error);
              }}
              onBlur={(e) => {
                const error = getEmailValidationError(e.target.value, t);
                setEmailError(error);
              }}
              className={cn(
                "ps-10",
                emailError && "border-amber-500 focus:border-amber-500",
              )}
              autoComplete="email"
            />
          </div>
          {emailError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {emailError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="phone">{t("account.phoneNumber")}</Label>
          <PhoneInput
            id="phone"
            value={phoneNumber}
            onChange={(value) => {
              setPhoneNumber(value);
              const cleaned = cleanPhoneNumber(value, selectedCountry);
              const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
              const error = fullPhone
                ? getPhoneValidationError(fullPhone, t)
                : null;
              setPhoneError(error);
            }}
            onCountryChange={(country) => {
              setSelectedCountry(country);
              if (phoneNumber) {
                const cleaned = cleanPhoneNumber(phoneNumber, country);
                const fullPhone = getFullPhoneNumber(cleaned, country);
                const error = fullPhone
                  ? getPhoneValidationError(fullPhone, t)
                  : null;
                setPhoneError(error);
              }
            }}
            defaultCountry={selectedCountry}
            placeholder={t("account.phonePlaceholder")}
            autoComplete="tel"
            className={
              phoneError ? "border-amber-500 focus:border-amber-500" : ""
            }
          />
          {phoneError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {phoneError}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
          {message}
        </div>
      )}

      <Button
        type="button"
        onClick={handleSendOtp}
        disabled={isLoading || !!emailError || !!phoneError}
        className="w-full"
        loading={isLoading}
      >
        {isLoading ? t("auth.sending") : t("auth.sendOtp")}
      </Button>
    </div>
  );
};
