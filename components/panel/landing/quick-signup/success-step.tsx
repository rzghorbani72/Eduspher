import { ArrowLeft, ExternalLink } from "lucide-react";

import { LANDING } from "../landing.messages";
import type { QuickSignupResult } from "./use-quick-signup";

const M = LANDING.quickSignup;

/**
 * Two doors, both real: the site opens in a new tab so the panel keeps this
 * tab, and the manager can take both.
 */
export function SuccessStep({ result }: { result: QuickSignupResult }) {
  return (
    <div className="pt-2 text-center">
      <h2 className="text-xl font-extrabold text-lp-ink">{M.doneTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-lp-muted">
        {result.siteReady ? M.doneSubtitle : M.doneSiteFallback}
      </p>

      <div className="mt-6 space-y-3">
        {result.siteReady && (
          <a
            href={result.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lp border border-lp-line-2 bg-white text-[15px] font-bold text-lp-ink transition-colors hover:border-lp-ink/25"
          >
            <ExternalLink className="h-4 w-4" />
            {M.viewSite}
          </a>
        )}
        <a
          href={result.panelUrl}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lp bg-lp-mint text-[15px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5"
        >
          {M.goToPanel}
          <ArrowLeft className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-5 text-[12px] text-lp-muted">{M.trialNote}</p>
    </div>
  );
}
