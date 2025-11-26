"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Lock, ArrowLeft, CheckCircle } from "lucide-react";

import { 
  validatePhoneAndEmail,
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
import { useSchoolPath } from "@/components/providers/school-provider";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string) => {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ""));
};

type Step = "identifier" | "otp" | "password" | "success";

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const [step, setStep] = useState<Step>("identifier");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    confirmed_password: "",
    otp: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateIdentifier = () => {
    if (!formData.identifier.trim()) {
      setError("Email or phone number is required");
      return false;
    }

    if (authMethod === "email" && !isValidEmail(formData.identifier)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (authMethod === "phone" && !isValidPhone(formData.identifier)) {
      setError("Please enter a valid phone number");
      return false;
    }

    return true;
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

  const handleValidate = async () => {
    if (!validateIdentifier()) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const phone = authMethod === "phone" ? formData.identifier : undefined;
      const email = authMethod === "email" ? formData.identifier : undefined;
      
      const result = await validatePhoneAndEmail(phone, email);
      if (result.phone_number === "unverified" || result.email === "unverified") {
        setError("Phone or email is not verified. Please verify your phone or email first.");
      }
      setValidated(true);
      setMessage("User validated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "User not found. Please check your email or phone number.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!validated) {
      await handleValidate();
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (authMethod === "email") {
        await sendEmailOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_EMAIL);
        setMessage("OTP sent to your email address");
      } else {
        await sendPhoneOtp(formData.identifier, OtpType.RESET_PASSWORD_BY_PHONE);
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
          formData.identifier,
          formData.otp,
          OtpType.RESET_PASSWORD_BY_EMAIL
        );
      } else {
        await verifyPhoneOtp(
          formData.identifier,
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
      await forgetPassword({
        identifier: formData.identifier,
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
    setError(null);
    setMessage(null);
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

          <div className="space-y-2">
            <Label htmlFor="identifier">
              {authMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {authMethod === "email" ? (
                  <Mail className="h-5 w-5 text-slate-400" />
                ) : (
                  <Phone className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <Input
                id="identifier"
                type={authMethod === "email" ? "email" : "tel"}
                placeholder={authMethod === "email" ? "Enter your email" : "Enter your phone number"}
                value={formData.identifier}
                onChange={(e) => handleInputChange("identifier", e.target.value)}
                className="pl-10"
                autoComplete={authMethod === "email" ? "email" : "tel"}
              />
            </div>
          </div>

          {!validated ? (
            <Button
              type="button"
              onClick={handleValidate}
              disabled={isLoading}
              className="w-full"
              loading={isLoading}
            >
              {isLoading ? "Validating..." : "Validate"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full"
              loading={isLoading}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          )}
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

