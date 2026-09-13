"use client";

import { Check, Link2, Users } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatNumber } from "@/lib/utils";

interface InviteFriendsCardProps {
  invitePath: string;
  seatsLeft: number;
}

/** A member fills the free seats with friends by sending the class link. */
export function InviteFriendsCard({
  invitePath,
  seatsLeft,
}: InviteFriendsCardProps) {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${invitePath}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; keep UI quiet.
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-theme bg-surface p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-(--theme-foreground)">
        <Users className="size-4 text-(--theme-primary)" aria-hidden="true" />
        {t("live.inviteFriendsTitle")}
      </p>
      <p className="text-xs text-muted">
        {t("live.inviteFriendsHint").replace(
          "{count}",
          formatNumber(seatsLeft, language),
        )}
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--theme-primary) px-3 py-2 text-xs font-semibold text-(--theme-on-primary)"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Link2 className="size-3.5" aria-hidden="true" />
        )}
        {copied ? t("live.inviteLinkCopied") : t("live.inviteCopyLink")}
      </button>
    </div>
  );
}
