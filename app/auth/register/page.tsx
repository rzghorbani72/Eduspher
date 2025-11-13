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
    <div className="mx-auto grid max-w-5xl gap-12 rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1.2fr_1fr] lg:px-12 lg:py-16">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Join EduSpher</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          Unlock curated courses, guided mentoring, and analytics that chart your progress. Create
          your learner profile to access the full experience.
        </p>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <li>• Personalised learning roadmap matched to your goals</li>
          <li>• Weekly mentor check-ins and peer accountability</li>
          <li>• Progress analytics and certificates recognised by hiring teams</li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={buildPath("/auth/login")}>
            Sign in here
          </Link>
          .
        </p>
      </div>
      <div className="space-y-6">
        <RegisterForm />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          By creating an account you agree to our{" "}
          <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={buildPath("/legal/terms")}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={buildPath("/legal/privacy")}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

