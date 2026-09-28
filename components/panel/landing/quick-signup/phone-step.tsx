'use client';

import { toEnglishDigits } from '@/lib/phone-utils';
import { useLocaleDigits } from '@/hooks/use-locale-digits';
import { HumanCheck } from '@/components/auth/human-check';
import { LANDING } from '../landing.messages';
import { DialogButton } from './dialog-button';
import type { useQuickSignup } from './use-quick-signup';

const M = LANDING.quickSignup;
/** Same locked Iran field as AdminPanel AuthPhoneField — no country picker. */
const PHONE_PLACEHOLDER = '0921 *** ** **';
const IRAN_PHONE_MAX_LENGTH = 11;

export function PhoneStep({ flow }: { flow: ReturnType<typeof useQuickSignup> }) {
  const localeDigits = useLocaleDigits();

  return (
    <div className="space-y-4">
      <div>
        <span className="text-lp-ink mb-1.5 block text-[13px] font-semibold">{M.phoneLabel}</span>
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
              .replace(/\D/g, '')
              .slice(0, IRAN_PHONE_MAX_LENGTH);
            flow.setPhone(digits);
          }}
          className="rounded-lp border-lp-line-2 placeholder:text-lp-muted focus:border-lp-ink/30 h-12 w-full border bg-transparent px-3.5 text-[15px] text-[#181c20] transition-colors outline-none"
        />
        <p className="text-lp-muted mt-1.5 text-[12px]">{M.phoneHint}</p>
      </div>

      <label className="text-lp-muted flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed">
        <input
          type="checkbox"
          checked={flow.accepted}
          onChange={(event) => flow.setAccepted(event.target.checked)}
          className="accent-lp-mint mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          {M.legalPrefix}
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-lp-ink font-semibold underline"
          >
            {M.legalTerms}
          </a>
          {M.legalAnd}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-lp-ink font-semibold underline"
          >
            {M.legalPrivacy}
          </a>
          {M.legalSuffix}
        </span>
      </label>

      <HumanCheck key={flow.captcha.resetKey} onVerify={flow.captcha.setToken} />

      <DialogButton
        label={M.continue}
        pending={flow.pending}
        disabled={!flow.canSubmitPhone}
        onClick={flow.submitPhone}
      />
      <DialogButton label={M.back} variant="ghost" onClick={flow.back} />
    </div>
  );
}
