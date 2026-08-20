"use client";

import { useState } from "react";

import { getClientBackendApiBaseUrl } from "@/lib/env";

/**
 * Report form on every academy site.
 *
 * A leaf client component on purpose: the footer around it stays server
 * rendered, so adding a reporting channel costs the page nothing in SEO.
 *
 * Deliberately requires no account — the people most likely to notice a
 * violation are visitors and students, and an auth wall would filter out
 * exactly those reports. Email is optional for the same reason.
 */
export function ReportAbuseDialog({ academyId }: { academyId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("sending");
    try {
      const response = await fetch(
        `${getClientBackendApiBaseUrl()}/compliance/public/abuse-reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reported_url: window.location.href,
            reason: reason.trim(),
            academy_id: academyId ?? undefined,
            reporter_email: email.trim() || undefined,
          }),
        },
      );
      setState(response.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="underline opacity-70 transition-opacity hover:opacity-100"
      >
        گزارش تخلف
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-current/15 p-3">
      {state === "sent" ? (
        <p className="text-[12px]">
          گزارش شما ثبت شد و حداکثر ظرف ۷۲ ساعت کاری بررسی می‌شود.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <label className="block text-[12px]" htmlFor="abuse-reason">
            چه مشکلی در این صفحه وجود دارد؟
          </label>
          <textarea
            id="abuse-reason"
            required
            minLength={10}
            maxLength={2000}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded border border-current/20 bg-transparent p-2 text-[12px]"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ایمیل (اختیاری، برای پیگیری)"
            className="w-full rounded border border-current/20 bg-transparent p-2 text-[12px]"
          />
          {state === "error" ? (
            <p className="text-[12px]">
              ثبت گزارش ممکن نشد. لطفاً به info@mentoma.ir ایمیل بزنید.
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={state === "sending" || reason.trim().length < 10}
              className="rounded border border-current/30 px-3 py-1 text-[12px] disabled:opacity-50"
            >
              ارسال گزارش
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 text-[12px] opacity-70"
            >
              انصراف
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
