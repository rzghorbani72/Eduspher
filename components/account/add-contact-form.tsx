"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { 
  sendEmailOtp, 
  sendPhoneOtp, 
  verifyEmailOtp, 
  verifyPhoneOtp 
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
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

const getEmailValidationError = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!isValidEmail(email)) return "Please enter a valid email address";
  return null;
};

const getPhoneValidationError = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!isValidPhone(phone)) return "Please enter a valid phone number";
  return null;
};

export const AddContactForm = ({ 
  method, 
  primaryMethod,
  defaultCountryCode,
  onSuccess 
}: AddContactFormProps) => {
  const router = useRouter();
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
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // OTP state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setEmailError(null);
    setPhoneError(null);

    try {
      if (method === "email") {
        if (!email.trim()) {
          setError("Email is required");
          setEmailError("Email is required");
          return;
        }
        const emailError = getEmailValidationError(email);
        if (emailError) {
          setError(emailError);
          setEmailError(emailError);
          return;
        }
        await sendEmailOtp(email, OtpType.REGISTER_EMAIL_VERIFICATION);
        setMessage("OTP sent to your email address");
        setOtpSent(true);
        setStep("otp");
      } else {
        if (!phoneNumber.trim()) {
          setError("Phone number is required");
          setPhoneError("Phone number is required");
          return;
        }
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
        const phoneError = getPhoneValidationError(fullPhone);
        if (phoneError) {
          setError(phoneError);
          setPhoneError(phoneError);
          return;
        }
        await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
        setMessage("OTP sent to your phone number");
        setOtpSent(true);
        setStep("otp");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (method === "email") {
        const result = await verifyEmailOtp(email, otp, OtpType.REGISTER_EMAIL_VERIFICATION);
        if (result.success !== false) {
          setStep("success");
          setMessage("Email verified and added successfully");
          onSuccess?.();
          setTimeout(() => {
            router.refresh();
          }, 1500);
        } else {
          setError("Invalid OTP. Please try again.");
        }
      } else {
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
        const result = await verifyPhoneOtp(fullPhone, otp, OtpType.REGISTER_PHONE_VERIFICATION);
        if (result.success !== false) {
          setStep("success");
          setMessage("Phone verified and added successfully");
          onSuccess?.();
          setTimeout(() => {
            router.refresh();
          }, 1500);
        } else {
          setError("Invalid OTP. Please try again.");
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid OTP";
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {method === "email" ? "Email Added Successfully!" : "Phone Added Successfully!"}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your {method === "email" ? "email address" : "phone number"} has been verified and added to your account.
          </p>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            autoComplete="one-time-code"
            className={error && error.includes("OTP") ? "border-amber-500 focus:border-amber-500" : ""}
          />
        </div>

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
            Back
          </Button>
          <Button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isLoading || !otp.trim()}
            className="flex-1"
            loading={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {method === "email" ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                const error = getEmailValidationError(value);
                setEmailError(error);
              }}
              onBlur={(e) => {
                const error = getEmailValidationError(e.target.value);
                setEmailError(error);
              }}
              className={cn("pl-10", emailError && "border-amber-500 focus:border-amber-500")}
              autoComplete="email"
            />
          </div>
          {emailError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{emailError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            id="phone"
            value={phoneNumber}
            onChange={(value) => {
              setPhoneNumber(value);
              const cleaned = cleanPhoneNumber(value, selectedCountry);
              const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
              const error = fullPhone ? getPhoneValidationError(fullPhone) : null;
              setPhoneError(error);
            }}
            onCountryChange={(country) => {
              setSelectedCountry(country);
              if (phoneNumber) {
                const cleaned = cleanPhoneNumber(phoneNumber, country);
                const fullPhone = getFullPhoneNumber(cleaned, country);
                const error = fullPhone ? getPhoneValidationError(fullPhone) : null;
                setPhoneError(error);
              }
            }}
            defaultCountry={selectedCountry}
            placeholder="Enter phone number"
            autoComplete="tel"
            className={phoneError ? "border-amber-500 focus:border-amber-500" : ""}
          />
          {phoneError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{phoneError}</p>
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
        {isLoading ? "Sending..." : "Send OTP"}
      </Button>
    </div>
  );
};

