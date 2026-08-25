"use client";

import "./globals.css";

import { AppErrorView } from "@/components/error/app-error-view";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="m-0 min-h-screen p-0">
        <AppErrorView reset={reset} />
      </body>
    </html>
  );
}
