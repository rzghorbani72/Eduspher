"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone } from "lucide-react";

import { postJson } from "@/lib/api/client";
import { env } from "@/lib/env";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useSchoolPath } from "@/components/providers/school-provider";
import { getDefaultCountry, getCountryByCode, type CountryCode } from "@/lib/country-codes";
import { getFullPhoneNumber, cleanPhoneNumber } from "@/lib/phone-utils";
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
  const buildPath = useSchoolPath();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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
        
        const schoolId = getCookieValue(env.schoolIdCookie);
        const finalSchoolId = schoolId ? Number(schoolId) : env.defaultSchoolId;
        
        await postJson("/auth/login", {
          identifier,
          password: values.password,
          school_id: finalSchoolId,
        });
        
        setAuthenticated(true);
        
        // Sync cart after login (non-blocking)
        const { loadAndMergeCart } = await import("@/app/actions/cart");
        loadAndMergeCart().catch(() => {
          // Silently fail - cart is still in localStorage
        });
        
        router.push(buildPath("/courses"));
        router.refresh();
      } catch (err) {
        setAuthenticated(false);
        const message = err instanceof Error ? err.message : "Unable to login. Try again.";
        setError(message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
                ? "border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
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
                ? "border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            )}
          >
            <Phone className="h-4 w-4" />
            Phone
          </button>
        </div>
        {loginMethod === "email" ? (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              id="identifier"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValue("identifier", e.target.value);
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
            placeholder="Enter phone number"
            autoComplete="tel"
          />
        )}
        {errors.identifier ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">{errors.identifier.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">{errors.password.message}</p>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          {error}
        </div>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

