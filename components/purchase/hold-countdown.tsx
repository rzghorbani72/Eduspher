"use client";

import { Timer } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";

interface HoldCountdownProps {
  expiresAt: string | null;
  expired: boolean;
  onExpired: () => void;
  onRenew: () => void;
}

const mmss = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/** How long the held seats stay the student's before they go back on sale. */
export function HoldCountdown({
  expiresAt,
  expired,
  onExpired,
  onRenew,
}: HoldCountdownProps) {
  const { t, language } = useTranslation();
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt || expired) return;
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const remaining = end - Date.now();
      setLeft(remaining);
      if (remaining <= 0) onExpired();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, expired, onExpired]);

  if (expired) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
        <span>{t("checkout.holdExpired")}</span>
        <button type="button" onClick={onRenew} className="font-bold underline">
          {t("checkout.holdAgain")}
        </button>
      </div>
    );
  }
  if (!expiresAt) return null;
  return (
    <p className="flex items-center gap-1.5 rounded-xl bg-(--theme-primary-subtle) px-3 py-2 text-xs font-semibold text-(--theme-primary-ink)">
      <Timer className="size-3.5" aria-hidden="true" />
      {t("checkout.holdCountdown").replace(
        "{time}",
        toPersianDigits(mmss(left), language),
      )}
    </p>
  );
}
