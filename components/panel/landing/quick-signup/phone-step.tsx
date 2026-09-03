"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { LANDING } from "../landing.messages";
import { DialogButton } from "./dialog-button";
import type { useQuickSignup } from "./use-quick-signup";

const M = LANDING.quickSignup;

export function PhoneStep({
  flow,
}: {
  flow: ReturnType<typeof useQuickSignup>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-lp-ink">
          {M.phoneLabel}
        </span>
        <PhoneInput
          value={flow.phone}
          onChange={flow.setPhone}
          defaultCountry={flow.country}
          onCountryChange={flow.setCountry}
          inputClassName="h-12 text-[15px]"
        />
        <p className="mt-1.5 text-[12px] text-lp-muted">{M.phoneHint}</p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-lp-muted">
        <input
          type="checkbox"
          checked={flow.accepted}
          onChange={(event) => flow.setAccepted(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-lp-mint"
        />
        <span>
          {M.legalPrefix}
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-lp-ink underline"
          >
            {M.legalTerms}
          </a>
          {M.legalAnd}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-lp-ink underline"
          >
            {M.legalPrivacy}
          </a>
          {M.legalSuffix}
        </span>
      </label>

      <DialogButton
        label={M.continue}
        pending={flow.pending}
        onClick={flow.submitPhone}
      />
      <DialogButton label={M.back} variant="ghost" onClick={flow.back} />
    </div>
  );
}
