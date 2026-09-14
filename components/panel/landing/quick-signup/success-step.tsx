import { ArrowLeft, ExternalLink } from 'lucide-react';

import { LANDING } from '../landing.messages';
import type { QuickSignupResult } from './use-quick-signup';

const M = LANDING.quickSignup;

/**
 * Two doors, both real: the site opens in a new tab so the panel keeps this
 * tab, and the manager can take both.
 */
export function SuccessStep({ result }: { result: QuickSignupResult }) {
  return (
    <div className="pt-2 text-center">
      <h2 className="text-lp-ink text-xl font-extrabold">{M.doneTitle}</h2>
      <p className="text-lp-muted mt-2 text-sm leading-relaxed">
        {result.siteReady ? M.doneSubtitle : M.doneSiteFallback}
      </p>

      <div className="mt-6 space-y-3">
        {result.siteReady && (
          <a
            href={result.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lp border-lp-line-2 text-lp-ink hover:border-lp-ink/25 flex h-12 w-full items-center justify-center gap-2 border bg-white text-[15px] font-bold transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {M.viewSite}
          </a>
        )}
        <a
          href={result.panelUrl}
          className="rounded-lp bg-lp-mint text-lp-ink shadow-lp-mint flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
        >
          {M.goToPanel}
          <ArrowLeft className="h-4 w-4" />
        </a>
      </div>

      <p className="text-lp-muted mt-5 text-[12px]">{M.trialNote}</p>
    </div>
  );
}
