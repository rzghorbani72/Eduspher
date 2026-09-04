"use client";

import { toEnglishDigits } from "@/lib/phone-utils";
import { useLocaleDigits } from "@/hooks/use-locale-digits";
import { LANDING } from "../landing.messages";
import { DialogButton } from "./dialog-button";
import type { useQuickSignup } from "./use-quick-signup";

const M = LANDING.quickSignup;
/** Same locked Iran field as AdminPanel AuthPhoneField — no country picker. */
const PHONE_PLACEHOLDER = "0921 *** ** **";
const IRAN_PHONE_MAX_LENGTH = 11;

export function PhoneStep({
  flow,
}: {
  flow: ReturnType<typeof useQuickSignup>;
}) {
  const localeDigits = useLocaleDigits();

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-lp-ink">
          {M.phoneLabel}
        </span>
        <input
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          maxLength={IRAN_PHONE_MAX_LENGTH}
          placeholder={localeDigits(PHONE_PLACEHOLDER)}
          value={localeDigits(flow.phone)}
          onChange={(event) => {
            const digits = toEnglishDigits(event.target.value)
              .replace(/\D/g, "")
              .slice(0, IRAN_PHONE_MAX_LENGTH);
            flow.setPhone(digits);
          }}
          className="h-12 w-full rounded-lp border border-lp-line-2 bg-transparent px-3.5 text-[15px] text-[#181c20] outline-none transition-colors placeholder:text-lp-muted focus:border-lp-ink/30"
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
