"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { getClientBackendApiBaseUrl } from "@/lib/env";
import { useDialogAction } from "@/hooks/use-dialog-action";
import { useTranslation } from "@/lib/i18n/hooks";

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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const { pending, run } = useDialogAction(() => setOpen(false), t("abuse.error"));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void run(async () => {
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
      return response.ok
        ? { ok: true, message: t("abuse.success") }
        : { ok: false, message: t("abuse.error") };
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="underline opacity-70 transition-opacity hover:opacity-100"
      >
        {t("abuse.report")}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-current/15 p-3">
      <form onSubmit={submit} className="space-y-2">
        <label className="block text-[12px]" htmlFor="abuse-reason">
          {t("abuse.question")}
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
          placeholder={t("abuse.emailPlaceholder")}
          className="w-full rounded border border-current/20 bg-transparent p-2 text-[12px]"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending || reason.trim().length < 10}
            className="flex items-center gap-1.5 rounded border border-current/30 px-3 py-1 text-[12px] disabled:opacity-50"
          >
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            {t("abuse.submit")}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1 text-[12px] opacity-70"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
