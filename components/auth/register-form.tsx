"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, Lock, CheckCircle } from "lucide-react";

import { 
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  postJson,
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { useSchoolPath } from "@/components/providers/school-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber, isValidPhoneNumber } from "@/lib/phone-utils";
import { env } from "@/lib/env";

const createRegisterSchema = (primaryMethod: 'phone' | 'email') => z
  .object({
    name: z.string({ required_error: "Full name is required" }).min(2, "Enter your full name"),
    email: primaryMethod === 'email' 
      ? z.string({ required_error: "Email is required" }).email("Enter a valid email address")
      : z.string().email("Enter a valid email address").optional().or(z.literal("")),
    phone_number: primaryMethod === 'phone'
      ? z.string({ required_error: "Phone number is required" }).min(6, "Enter a valid phone number")
      : z.string().min(6, "Enter a valid phone number").optional().or(z.literal("")),
    display_name: z
      .string({ required_error: "Display name is required" })
      .min(2, "Display name is required"),
    password: z.string({ required_error: "Password is required" }).min(6, "Minimum 6 characters"),
    confirmed_password: z
      .string({ required_error: "Please confirm your password" })
      .min(6, "Minimum 6 characters"),
    bio: z.string().max(300, "Maximum 300 characters").optional(),
  })
  .refine((values) => values.password === values.confirmed_password, {
    path: ["confirmed_password"],
    message: "Passwords must match",
  });

type Step = "verification" | "form";

interface RegisterFormProps {
  defaultCountryCode?: string;
  primaryVerificationMethod?: 'phone' | 'email';
}

export const RegisterForm = ({ defaultCountryCode, primaryVerificationMethod = 'phone' }: RegisterFormProps) => {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const buildPath = useSchoolPath();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("verification");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const registerSchema = createRegisterSchema(primaryVerificationMethod);
  type RegisterValues = z.infer<typeof registerSchema>;

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
      email: "",
      phone_number: "",
      password: "",
      confirmed_password: "",
      display_name: "",
      bio: "",
    },
  });

  const getInitialCountry = () => {
    if (defaultCountryCode) {
      const country = getCountryByCode(defaultCountryCode);
      if (country) return country;
    }
    return getDefaultCountry();
  };
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const isValidPhone = (phone: string) => {
    const cleaned = cleanPhoneNumber(phone, selectedCountry);
    return isValidPhoneNumber(cleaned, selectedCountry);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneNumber || !isValidPhone(phoneNumber)) {
      setError("Please enter a valid phone number first");
      return;
    }

    setOtpLoading(true);
    setError(null);
    setMessage(null);

    try {
      const fullPhone = getFullPhoneNumber(cleanPhoneNumber(phoneNumber, selectedCountry), selectedCountry);
      await sendPhoneOtp(fullPhone, OtpType.REGISTER_PHONE_VERIFICATION);
      setPhoneOtpSent(true);
      setMessage("OTP sent to your phone number");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp.trim()) {
      setError("Please enter the OTP");
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
        setMessage("Phone verified successfully");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid OTP";
      setError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    const email = getValues("email");
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address first");
      return;
    }

    setOtpLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendEmailOtp(email as string, OtpType.REGISTER_EMAIL_VERIFICATION);
      setEmailOtpSent(true);
      setMessage("OTP sent to your email address");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    const email = getValues("email");
    if (!email || !isValidEmail(email)) {
      setError("Email is required for verification");
      return;
    }

    setOtpLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await verifyEmailOtp(email as string, emailOtp, OtpType.REGISTER_EMAIL_VERIFICATION);
      
      if (result.success !== false) {
        setEmailOtpVerified(true);
        setMessage("Email verified successfully");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid OTP";
      setError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only verify primary method during registration
    if (primaryVerificationMethod === 'phone') {
      if (!phoneOtpSent) {
        await handleSendPhoneOtp();
        return;
      }
      if (!phoneOtpVerified) {
        setError("Please verify your phone OTP first");
        return;
      }
    } else {
      // Email is primary
      if (!emailOtpSent) {
        await handleSendEmailOtp();
        return;
      }
      if (!emailOtpVerified) {
        setError("Please verify your email OTP first");
        return;
      }
    }

    // All verifications complete, move to form step
    setStep("form");
    setError(null);
    setMessage(null);
  };

  const onFormSubmit = handleSubmit(async (values) => {
    if (isLoading || isSubmittingRef.current) {
      return;
    }

    setIsLoading(true);
    isSubmittingRef.current = true;
    setError(null);
    setMessage(null);

    try {
      // Ensure primary method OTP is verified
      const primaryVerified = primaryVerificationMethod === 'phone' ? phoneOtpVerified : emailOtpVerified;
      if (!primaryVerified) {
        const methodName = primaryVerificationMethod === 'phone' ? 'phone' : 'email';
        setError(`Please verify ${methodName} OTP first`);
        return;
      }

      const getCookieValue = (name: string) => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : null;
      };
      
      const schoolId = getCookieValue(env.schoolIdCookie);
      const finalSchoolId = schoolId ? Number(schoolId) : env.defaultSchoolId;
      
      // Build user data based on primary method
      const userData: any = {
        name: values.name,
        display_name: values.display_name,
        password: values.password,
        confirmed_password: values.confirmed_password,
        bio: values.bio,
        role: "USER",
        school_id: finalSchoolId,
      };

      // Add primary method (required) - only one method is shown and verified during registration
      if (primaryVerificationMethod === 'phone') {
        if (!phoneNumber || !isValidPhone(phoneNumber)) {
          setError("Phone number is required");
          return;
        }
        const cleanedPhone = cleanPhoneNumber(phoneNumber, selectedCountry);
        const fullPhone = getFullPhoneNumber(cleanedPhone, selectedCountry);
        userData.phone_number = fullPhone;
        userData.phone_otp = phoneOtpVerified && phoneOtp.trim() ? phoneOtp.trim() : undefined;
      } else {
        if (!values.email || !isValidEmail(values.email)) {
          setError("Email is required");
          return;
        }
        userData.email = values.email;
        userData.email_otp = emailOtpVerified && emailOtp.trim() ? emailOtp.trim() : undefined;
      }
      // Note: Secondary method (email or phone) can be verified later in account settings

      await postJson("/auth/register", userData);
      
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push(buildPath("/auth/login"));
        router.refresh();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to create account. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  });

  const watchedEmail = watch("email");
  const hasEmail = watchedEmail && isValidEmail(watchedEmail);

  return (
    <div className="space-y-6">
      {step === "verification" && (
        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          {/* Show only primary verification method */}
          {primaryVerificationMethod === 'email' ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input 
                  id="email" 
                  type="email" 
                  autoComplete="email" 
                  {...register("email")}
                  className="pl-10"
                />
              </div>
              {errors.email ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">{errors.email.message}</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone number</Label>
              <PhoneInput
                id="phone_number"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value);
                  const cleaned = cleanPhoneNumber(value, selectedCountry);
                  const fullPhone = getFullPhoneNumber(cleaned, selectedCountry);
                  setValue("phone_number", fullPhone, { shouldValidate: true });
                }}
                onCountryChange={(country) => {
                  setSelectedCountry(country);
                  if (phoneNumber) {
                    const cleaned = cleanPhoneNumber(phoneNumber, country);
                    const fullPhone = getFullPhoneNumber(cleaned, country);
                    setValue("phone_number", fullPhone, { shouldValidate: true });
                  }
                }}
                defaultCountry={selectedCountry}
                placeholder="Enter phone number"
              />
              {errors.phone_number ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {errors.phone_number.message}
                </p>
              ) : null}
            </div>
          )}

          {/* Show only primary method OTP section */}
          {(
            primaryVerificationMethod === 'phone' ? (
              <div className="space-y-2">
                <Label htmlFor="phoneOtp">Phone OTP</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneOtp"
                    type="text"
                    placeholder="Enter phone OTP"
                    value={phoneOtp}
                    onChange={(e) => {
                      setPhoneOtp(e.target.value);
                      setError(null);
                    }}
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={isLoading || otpLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={otpLoading || !phoneNumber || !isValidPhone(phoneNumber)}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {otpLoading ? "Sending..." : phoneOtpSent ? "Resend OTP" : "Send Phone OTP"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={otpLoading || !phoneOtp.trim() || phoneOtpVerified}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {otpLoading ? "Verifying..." : phoneOtpVerified ? "✓ Verified" : "Verify Phone OTP"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="emailOtp">Email OTP</Label>
                <div className="flex gap-2">
                  <Input
                    id="emailOtp"
                    type="text"
                    placeholder="Enter email OTP"
                    value={emailOtp}
                    onChange={(e) => {
                      setEmailOtp(e.target.value);
                      setError(null);
                    }}
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={isLoading || otpLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={otpLoading || !hasEmail}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {otpLoading ? "Sending..." : emailOtpSent ? "Resend OTP" : "Send Email OTP"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={otpLoading || !emailOtp.trim() || emailOtpVerified}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {otpLoading ? "Verifying..." : emailOtpVerified ? "✓ Verified" : "Verify Email OTP"}
                  </Button>
                </div>
              </div>
            )
          )}

          {error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
              {error}
            </div>
          ) : null}

          {message && !error ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
              {message}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading || otpLoading}>
            {isLoading || otpLoading ? "Processing..." : "Continue to Form"}
          </Button>
        </form>
      )}

      {step === "form" && (
        <form onSubmit={onFormSubmit} className="space-y-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/70">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                {primaryVerificationMethod === 'phone' ? 'Phone verified' : 'Email verified'}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                You can verify your {primaryVerificationMethod === 'phone' ? 'email' : 'phone'} later in account settings
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" autoComplete="name" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" {...register("display_name")} />
              {errors.display_name ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {errors.display_name.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  autoComplete="new-password" 
                  {...register("password")}
                  className="pl-10"
                />
              </div>
              {errors.password ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmed_password">Confirm password</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="confirmed_password"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmed_password")}
                  className="pl-10"
                />
              </div>
              {errors.confirmed_password ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {errors.confirmed_password.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea id="bio" rows={3} {...register("bio")} />
            {errors.bio ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">{errors.bio.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
              {error}
            </div>
          ) : null}

          {message && !error ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
              {message}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("verification")}
              className="flex-1"
            >
              Back to Verification
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading} loading={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
