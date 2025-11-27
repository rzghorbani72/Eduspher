"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { processCheckout } from "@/app/actions/checkout";
import type { CourseSummary } from "@/lib/api/types";
import { useSchoolPath } from "@/components/providers/school-provider";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { formatCurrencyWithSchool } from "@/lib/utils";

interface CheckoutFormProps {
  course: CourseSummary;
  user: {
    id: number;
    email: string;
    phone_number: string;
    name: string;
    currentProfile: {
      id: number;
      schoolId: number;
      role: string;
      displayName: string;
    };
    currentSchool?: {
      id: number;
      name: string;
      slug: string;
      domain: string | null;
      currency: string;
      currency_symbol: string;
    } | null;
  };
  session: {
    userId: number;
    profileId: number;
    schoolId: number | null;
  };
}

export function CheckoutForm({ course, user, session }: CheckoutFormProps) {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await processCheckout({
          course_id: course.id,
          user_id: user.id,
          profile_id: session.profileId,
        });

        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push(buildPath(`/courses/${course.id}`));
            router.refresh();
          }, 1500);
        } else {
          setError(result.error || "Failed to complete checkout. Please try again.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      }
    });
  };

  if (success) {
    return (
      <div className="mt-6 space-y-4 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/70">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              Enrollment Successful!
            </h4>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Redirecting you to the course...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Enrolling as
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {user.display_name}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {user.email || user.phone_number}
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full"
          size="lg"
          loading={pending}
          disabled={pending || success}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : course.is_free ? (
            "Complete Enrollment"
          ) : (
            `Complete Purchase - ${formatCurrencyWithSchool(course.price, user.currentSchool || null)}`
          )}
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          By completing your purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}




