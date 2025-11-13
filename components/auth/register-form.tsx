"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { register as registerUser } from "@/lib/api/client";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export const RegisterForm = () => {
  const router = useRouter();
  const { setAuthenticated } = useAuthContext();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        await registerUser({
          ...values,
          email: values.email || undefined,
        });
        setAuthenticated(true);
        router.push("/courses");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to create account. Try again.";
        setError(message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone number</Label>
          <Input id="phone_number" autoComplete="tel" {...register("phone_number")} />
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
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmed_password">Confirm password</Label>
          <Input
            id="confirmed_password"
            type="password"
            autoComplete="new-password"
            {...register("confirmed_password")}
          />
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
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};

