"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Lock, ArrowLeft, CheckCircle } from "lucide-react";

import { 
  sendEmailOtp, 
  sendPhoneOtp, 
  verifyEmailOtp, 
  verifyPhoneOtp, 
  forgetPassword 
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useSchoolPath } from "@/components/providers/school-provider";
import { isValidEmail, isValidPhone, getEmailValidationError, getPhoneValidationError } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber } from "@/lib/phone-utils";

type Step = "identifier" | "otp" | "password" | "success";

interface ForgotPasswordFormProps {
  defaultCountryCode?: string;
}

export const ForgotPasswordForm = ({ defaultCountryCode }: ForgotPasswordFormProps = {}) => {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const [step, setStep] = useState<Step>("identifier");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    
    // Real-time validation for identifier field (only for email, phone handled separately)
    if (field === "identifier" && authMethod === "email") {
      setEmail(value);
      const emailError = getEmailValidationError(value);
      setIdentifierError(emailError);
    }
  };

  const validatePassword = () => {
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmed_password) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    // Validate identifier format first
    if (authMethod === "email") {
      if (!email.trim()) {
        setError("Email is required");
        setIdentifierError("Email is required");
        return;
      }
      const emailError = getEmailValidationError(email);
      if (emailError) {
        setError(emailError);
        setIdentifierError(emailError);
        return;
      }
    } else {
      if (!phoneNumber.trim()) {
        setError("Phone number is required");
        setIdentifierError("Phone number is required");
        return;
      }
      const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
      const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
      const phoneError = getPhoneValidationError(fullPhone);
      if (phoneError) {
        setError(phoneError);
        setIdentifierError(phoneError);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);
    setIdentifierError(null);

    try {
      if (authMethod === "email") {
        await sendEmailOtp(email, OtpType.RESET_PASSWORD_BY_EMAIL);
        setMessage("OTP sent to your email address");
      } else {
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
        await sendPhoneOtp(fullPhone, OtpType.RESET_PASSWORD_BY_PHONE);
        setMessage("OTP sent to your phone number");
      }
      setStep("otp");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      setError("OTP is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (authMethod === "email") {
        await verifyEmailOtp(
          email,
          formData.otp,
          OtpType.RESET_PASSWORD_BY_EMAIL
        );
      } else {
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
        await verifyPhoneOtp(
          fullPhone,
          formData.otp,
          OtpType.RESET_PASSWORD_BY_PHONE
        );
      }
      setStep("password");
      setMessage("OTP verified successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid OTP";
      setError(errorMessage);
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
      let identifier: string;
      if (authMethod === "email") {
        identifier = email;
      } else {
        const cleaned = cleanPhoneNumber(phoneNumber, selectedCountry);
        identifier = getFullPhoneNumber(cleaned, selectedCountry);
      }

      await forgetPassword({
        identifier,
        password: formData.password,
        confirmed_password: formData.confirmed_password,
        otp: formData.otp,
      });

      setStep("success");
      setMessage("Password reset successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("identifier");
    setFormData({
      identifier: "",
      password: "",
      confirmed_password: "",
      otp: "",
    });
    setEmail("");
    setPhoneNumber("");
    setError(null);
    setMessage(null);
    setIdentifierError(null);
  };

  return (
    <div className="space-y-6">
      {step === "identifier" && (
        <div className="space-y-4">
          <div className="flex gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setError(null);
                setIdentifierError(null);
                setEmail("");
                setPhoneNumber("");
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authMethod === "email"
                  ? "bg-sky-600 text-white dark:bg-sky-500"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setError(null);
                setIdentifierError(null);
                setEmail("");
                setPhoneNumber("");
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authMethod === "phone"
                  ? "bg-sky-600 text-white dark:bg-sky-500"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
              }`}
            >
              Phone
            </button>
          </div>

          {authMethod === "email" ? (
            <div className="space-y-1">
              <Label htmlFor="identifier">Email Address</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    const error = getEmailValidationError(value);
                    setIdentifierError(error);
                  }}
                  onBlur={(e) => {
                    const error = getEmailValidationError(e.target.value);
                    setIdentifierError(error);
                  }}
                  className={cn("pl-10", identifierError && "border-amber-500 focus:border-amber-500")}
                  autoComplete="email"
                />
              </div>
              {identifierError && (
                <p className="text-sm text-amber-600 dark:text-amber-400">{identifierError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="identifier">Phone Number</Label>
              <PhoneInput
                id="identifier"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value);
                  const cleaned = cleanPhoneNumber(value, selectedCountry);
                  const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
                  const error = fullPhone ? getPhoneValidationError(fullPhone) : null;
                  setIdentifierError(error);
                }}
                onCountryChange={(country) => {
                  setSelectedCountry(country);
                  if (phoneNumber) {
                    const cleaned = cleanPhoneNumber(phoneNumber, country);
                    const fullPhone = getFullPhoneNumber(cleaned, country);
                    const error = fullPhone ? getPhoneValidationError(fullPhone) : null;
                    setIdentifierError(error);
                  }
                }}
                defaultCountry={selectedCountry}
                placeholder="Enter phone number"
                autoComplete="tel"
                className={identifierError ? "border-amber-500 focus:border-amber-500" : ""}
              />
              {identifierError && (
                <p className="text-sm text-amber-600 dark:text-amber-400">{identifierError}</p>
              )}
            </div>
          )}

          <Button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading || !!identifierError}
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={(e) => handleInputChange("otp", e.target.value)}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("identifier")}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="flex-1"
              loading={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </div>
      )}

      {step === "password" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmed_password">Confirm Password</Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                id="confirmed_password"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmed_password}
                onChange={(e) => handleInputChange("confirmed_password", e.target.value)}
                className="pl-10"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("otp")}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading}
              className="flex-1"
              loading={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Password Reset Successfully!
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Your password has been reset. You can now login with your new password.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Reset Another Password
            </Button>
            <Button
              type="button"
              onClick={() => router.push(buildPath("/auth/login"))}
              className="flex-1"
            >
              Go to Login
            </Button>
          </div>
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

      <div className="text-center text-sm">
        <Link
          href={buildPath("/auth/login")}
          className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

