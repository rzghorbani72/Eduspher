"use client";

import { AppErrorView } from "@/components/error/app-error-view";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppErrorView reset={reset} />;
}
