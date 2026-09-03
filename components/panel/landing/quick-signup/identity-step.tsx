"use client";

import { Check, CircleDashed, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ACADEMY_DOMAIN, toSlug } from "@/lib/slug";
import { LANDING } from "../landing.messages";
import { DialogButton } from "./dialog-button";
import type { useQuickSignup } from "./use-quick-signup";

const M = LANDING.quickSignup;

const HINT_BY_STATUS = {
  invalid: { text: M.slugInvalid, tone: "text-red-600" },
  taken: { text: M.slugTaken, tone: "text-red-600" },
  available: { text: M.slugAvailable, tone: "text-emerald-600" },
  checking: { text: M.slugChecking, tone: "text-lp-muted" },
  idle: { text: M.slugHint, tone: "text-lp-muted" },
} as const;

export function IdentityStep({
  flow,
}: {
  flow: ReturnType<typeof useQuickSignup>;
}) {
  const hint = HINT_BY_STATUS[flow.slugStatus];

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-lp-ink">
          {M.nameLabel}
        </span>
        <input
          value={flow.name}
          autoFocus
          placeholder={M.namePlaceholder}
          onChange={(event) => {
            const value = event.target.value;
            flow.setName(value);
            // Only ever suggested, never overwritten: once the manager edits the
            // address it is theirs, and a Persian name suggests nothing at all.
            if (!flow.slug || flow.slug === toSlug(flow.name)) {
              flow.setSlug(toSlug(value));
            }
          }}
          className="h-12 w-full rounded-lp border border-lp-line-2 px-3.5 text-[15px] text-lp-ink outline-none transition-colors focus:border-lp-ink/30"
        />
      </label>

      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-lp-ink">
          {M.slugLabel}
        </span>
        <div
          dir="ltr"
          className={cn(
            "flex h-12 items-center overflow-hidden rounded-lp border transition-colors",
            flow.slugStatus === "available" && "border-emerald-500",
            (flow.slugStatus === "taken" || flow.slugStatus === "invalid") &&
              "border-red-400",
            (flow.slugStatus === "idle" || flow.slugStatus === "checking") &&
              "border-lp-line-2",
          )}
        >
          <input
            value={flow.slug}
            placeholder={M.slugPlaceholder}
            onChange={(event) => flow.setSlug(toSlug(event.target.value))}
            className="min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-lp-ink outline-none"
          />
          <span className="flex shrink-0 items-center gap-1.5 border-l border-lp-line-2 bg-black/[0.03] px-3 text-[12px] text-lp-muted">
            .{ACADEMY_DOMAIN}
            {flow.slugStatus === "checking" && (
              <CircleDashed className="h-3 w-3 animate-spin" />
            )}
            {flow.slugStatus === "available" && (
              <Check className="h-3 w-3 text-emerald-600" />
            )}
            {(flow.slugStatus === "taken" || flow.slugStatus === "invalid") && (
              <X className="h-3 w-3 text-red-500" />
            )}
          </span>
        </div>
        <p className={cn("mt-1.5 text-[12px]", hint.tone)}>{hint.text}</p>
      </div>

      <DialogButton
        label={M.continue}
        pending={flow.pending}
        onClick={flow.submitIdentity}
      />
    </div>
  );
}
