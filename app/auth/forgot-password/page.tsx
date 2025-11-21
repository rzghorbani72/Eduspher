import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password using email or phone verification.",
};

export default async function ForgotPasswordPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:flex-row lg:px-12 lg:py-16">
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          Enter your email or phone number to receive a verification code. Once verified, you can set a new password for your account.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Remember your password?{" "}
          <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={buildPath("/auth/login")}>
            Sign in here
          </Link>
          .
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

