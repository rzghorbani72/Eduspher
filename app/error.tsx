"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { AppErrorView } from "@/components/error/app-error-view";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <AppErrorView reset={reset} />;
}
