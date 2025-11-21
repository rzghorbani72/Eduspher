import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join EduSpher and start your personalised learning journey.",
};

export default async function RegisterPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1.2fr_1fr] lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Join EduSpher</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          Unlock curated courses, guided mentoring, and analytics that chart your progress. Create
          your learner profile to access the full experience.
        </p>
        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-[var(--theme-primary)] font-bold mt-0.5">•</span>
            <span>Personalised learning roadmap matched to your goals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--theme-primary)] font-bold mt-0.5">•</span>
            <span>Weekly mentor check-ins and peer accountability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--theme-primary)] font-bold mt-0.5">•</span>
            <span>Progress analytics and certificates recognised by hiring teams</span>
          </li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/login")}>
            Sign in here
          </Link>
          .
        </p>
      </div>
      <div className="space-y-5">
        <RegisterForm />
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          By creating an account you agree to our{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/legal/terms")}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/legal/privacy")}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

