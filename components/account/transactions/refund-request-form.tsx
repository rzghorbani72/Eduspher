"use client";

import { useState } from "react";
import { Loader2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { requestRefund } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";

export function RefundRequestForm({ paymentId }: { paymentId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await requestRefund({
        payment_id: paymentId,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      logger.ok("Payments", "RefundRequested", { has_reason: Boolean(reason.trim()) });
      setDone(true);
    } catch (err) {
      logger.warn("Payments", "RefundRequestRejected", {
        has_reason: Boolean(reason.trim()),
      });
      // The academy's refund window lives on the server; show what it said.
      setError(err instanceof Error ? err.message : t("account.refundRequestFailed"));
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-2xl border border-theme bg-surface p-5 text-sm text-green-600">
        {t("account.refundRequested")}
      </p>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Undo2 className="me-2 size-4" />
        {t("account.requestRefund")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-theme bg-card p-5 "
    >
      <h2 className="text-base font-semibold text-(--theme-foreground)">
        {t("account.requestRefund")}
      </h2>
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted">{t("account.refundReason")}</span>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("account.refundReasonPlaceholder")}
          maxLength={500}
          rows={4}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={sending}>
          {sending ? <Loader2 className="me-2 size-4 animate-spin" /> : null}
          {t("account.submitRefundRequest")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={sending}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
