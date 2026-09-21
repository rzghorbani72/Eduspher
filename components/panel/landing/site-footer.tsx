import { EnamadSeal } from '@/components/academy/enamad-seal';
import { PLATFORM_ENAMAD_SEAL_CODE, PLATFORM_ENAMAD_SEAL_ID } from '@/lib/seo/enamad';

import { BrandMark } from './brand-mark';
import { LANDING } from './landing.messages';
import { SmartNavLink } from './smart-nav-link';

type Props = { loginUrl: string };

const M = LANDING.footer;

export function SiteFooter({ loginUrl }: Props) {
  return (
    <footer className="border-lp-line border-t">
      <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-7">
        <div className="grid gap-9 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <BrandMark size={24} />
            <p className="text-lp-muted-2 mt-3.5 max-w-[400px] text-[13.5px] leading-loose">
              {M.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <div className="border-lp-ink/18 text-lp-faint grid size-[90px] place-items-center overflow-hidden rounded-2xl border border-dashed bg-white text-[10.5px]">
                <EnamadSeal sealId={PLATFORM_ENAMAD_SEAL_ID} code={PLATFORM_ENAMAD_SEAL_CODE} />
              </div>
              <div className="border-lp-ink/18 text-lp-faint grid size-[90px] place-items-center rounded-2xl border border-dashed bg-white text-[10.5px]">
                {M.license}
              </div>
            </div>
          </div>
          <nav className="text-lp-muted grid grid-cols-2 gap-x-12 gap-y-3 text-[14px] sm:grid-cols-3">
            {M.links.map((link) => (
              <SmartNavLink key={link.href} href={link.href} sectionId={link.sectionId}>
                {link.label}
              </SmartNavLink>
            ))}
            <a href={loginUrl}>{M.login}</a>
          </nav>
        </div>
        <div className="border-lp-line text-lp-faint mt-10 flex flex-wrap items-center gap-3 border-t pt-5 text-[13px]">
          <span>{M.madeWith}</span>
          <span className="ms-auto">{M.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
