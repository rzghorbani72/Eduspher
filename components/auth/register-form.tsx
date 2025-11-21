"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, Lock, CheckCircle, ArrowLeft } from "lucide-react";

import { 
  register as registerUser,
  sendEmailOtp,
  sendPhoneOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
} from "@/lib/api/client";
import { OtpType } from "@/lib/constants";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSchoolPath } from "@/components/providers/school-provider";

const registerSchema = z
  .object({
    name: z.string({ required_error: "Full name is required" }).min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
    phone_number: z.string({ required_error: "Phone number is required" }).min(6, "Enter a valid phone number"),
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

type RegisterValues = z.infer<typeof registerSchema>;

type Step = "form" | "phone-otp" | "email-otp" | "success";

export const RegisterForm = () => {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const buildPath = useSchoolPath();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
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

  const formValues = watch();
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ""));
  };

  const handleSendPhoneOtp = async () => {
    const phone = getValues("phone_number");
    if (!phone || !isValidPhone(phone)) {
      setError("Please enter a valid phone number first");
      return;
    }

    setOtpLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendPhoneOtp(phone, OtpType.REGISTER_PHONE_VERIFICATION);
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
      const phone = getValues("phone_number");
      const result = await verifyPhoneOtp(
        phone,
        phoneOtp,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      
      if (result.success !== false) {
        setPhoneOtpVerified(true);
        setMessage("Phone verified successfully");
        
        // If email is provided, move to email OTP step, otherwise proceed to registration
        const email = getValues("email");
        if (email && isValidEmail(email)) {
          setStep("email-otp");
        } else {
          // No email, proceed directly to registration
          await handleFinalRegistration();
        }
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
      const result = await verifyEmailOtp(
        email as string,
        emailOtp,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      
      if (result.success !== false) {
        setEmailOtpVerified(true);
        setMessage("Email verified successfully");
        await handleFinalRegistration();
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

  const handleFinalRegistration = async () => {
    // The user was already created in onFormSubmit
    // The OTP verification already updated the confirmation status (phone_confirmed/email_confirmed)
    // Registration is complete - we can proceed to login
    setAuthenticated(true);
    setStep("success");
    setTimeout(() => {
      router.push(buildPath("/courses"));
      router.refresh();
    }, 2000);
  };

  const onFormSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    
    // Validate phone number
    if (!isValidPhone(values.phone_number)) {
      setError("Please enter a valid phone number");
      return;
    }

    // First, create the user account (with unconfirmed status) so we can send OTP
    setIsLoading(true);
    try {
      // Create user first via register endpoint - this creates user with unconfirmed status
      // This is necessary because sendPhoneOtp requires the user to exist
      await registerUser({
        ...values,
        email: values.email || undefined,
      });
      
      // Now that user exists, we can send OTP
      setStep("phone-otp");
      // Send OTP automatically
      setOtpLoading(true);
      try {
        await sendPhoneOtp(values.phone_number, OtpType.REGISTER_PHONE_VERIFICATION);
        setPhoneOtpSent(true);
        setMessage("OTP sent to your phone number");
      } catch (otpErr) {
        const otpErrorMessage = otpErr instanceof Error ? otpErr.message : "Failed to send OTP";
        setError(otpErrorMessage);
      } finally {
        setOtpLoading(false);
      }
    } catch (err) {
      // If user already exists or registered, that's okay - proceed to OTP
      const errorMessage = err instanceof Error ? err.message : "Unable to create account. Try again.";
      // Check if error is about existing user - if so, proceed to OTP
      if (errorMessage.toLowerCase().includes("already") || 
          errorMessage.toLowerCase().includes("exists") ||
          errorMessage.toLowerCase().includes("registered")) {
        setStep("phone-otp");
        // Try to send OTP anyway - user might exist
        setOtpLoading(true);
        try {
          await sendPhoneOtp(values.phone_number, OtpType.REGISTER_PHONE_VERIFICATION);
          setPhoneOtpSent(true);
          setMessage("OTP sent to your phone number");
        } catch (otpErr) {
          const otpErrorMessage = otpErr instanceof Error ? otpErr.message : "Failed to send OTP";
          setError(otpErrorMessage);
        } finally {
          setOtpLoading(false);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="space-y-6">
      {step === "form" && (
        <form onSubmit={onFormSubmit} className="space-y-6">
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
              <Label htmlFor="email">Email (optional)</Label>
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
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone number</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <Input 
                  id="phone_number" 
                  autoComplete="tel" 
                  {...register("phone_number")}
                  className="pl-10"
                />
              </div>
              {errors.phone_number ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {errors.phone_number.message}
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
          <Button type="submit" className="w-full" loading={pending || otpLoading || isLoading}>
            {pending || otpLoading || isLoading ? "Processing..." : "Continue to Verification"}
          </Button>
        </form>
      )}

      {step === "phone-otp" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone_otp">Phone Verification Code</Label>
            <Input
              id="phone_otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={phoneOtp}
              onChange={(e) => {
                setPhoneOtp(e.target.value);
                setError(null);
              }}
              maxLength={6}
              autoComplete="one-time-code"
            />
            {!phoneOtpSent && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendPhoneOtp}
                disabled={otpLoading}
                className="w-full"
                loading={otpLoading}
              >
                {otpLoading ? "Sending..." : "Send OTP"}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("form")}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleVerifyPhoneOtp}
              disabled={otpLoading || !phoneOtp.trim()}
              className="flex-1"
              loading={otpLoading}
            >
              {otpLoading ? "Verifying..." : "Verify Phone"}
            </Button>
          </div>
        </div>
      )}

      {step === "email-otp" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email_otp">Email Verification Code</Label>
            <Input
              id="email_otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={emailOtp}
              onChange={(e) => {
                setEmailOtp(e.target.value);
                setError(null);
              }}
              maxLength={6}
              autoComplete="one-time-code"
            />
            {!emailOtpSent && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmailOtp}
                disabled={otpLoading}
                className="w-full"
                loading={otpLoading}
              >
                {otpLoading ? "Sending..." : "Send OTP"}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("phone-otp")}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleVerifyEmailOtp}
              disabled={otpLoading || !emailOtp.trim()}
              className="flex-1"
              loading={otpLoading}
            >
              {otpLoading ? "Verifying..." : "Verify Email"}
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
              Account Created Successfully!
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      )}

      {error && step !== "form" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
          {message}
        </div>
      )}
    </div>
  );
};

