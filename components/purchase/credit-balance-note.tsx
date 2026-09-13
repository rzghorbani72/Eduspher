"use client";

import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { getJson } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrency } from "@/lib/utils";

/** Store credit the signed-in student holds in this academy; silent when none. */
export function CreditBalanceNote({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    void getJson<{ data: { balance: number } }>("/student-credit/balance")
      .then((res) => setBalance(res.data.balance))
      .catch(() => setBalance(0));
  }, []);

  if (balance <= 0) return null;
  return (
    <p
      className={`flex items-center gap-2 rounded-xl bg-(--theme-primary-subtle) px-3 py-2 text-xs font-semibold text-(--theme-primary-ink) ${className ?? ""}`}
    >
      <Wallet className="size-4" aria-hidden="true" />
      {t("checkout.creditAvailable").replace(
        "{amount}",
        formatCurrency(balance, { divideBy: 1 }),
      )}
      <span className="font-normal text-muted">
        · {t("checkout.creditNotCash")}
      </span>
    </p>
  );
}
