"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { login } from "@/lib/api/client";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email or phone is required" })
    .min(1, "Email or phone is required"),
  password: z.string({ required_error: "Password is required" }).min(6, "Minimum 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
        await login(values);
        setAuthenticated(true);
        router.push("/courses");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to login. Try again.";
        setError(message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="identifier">Email or phone</Label>
        <Input id="identifier" autoComplete="username" {...register("identifier")} />
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

