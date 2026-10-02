import type { ReactNode } from 'react';

import { MobileCtaBar } from './mobile-cta-bar';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

type Props = {
  loginUrl: string;
  registerUrl: string;
  children: ReactNode;
};

/** Shared chrome for every page that wears the landing look. */
export function LandingShell({ loginUrl, registerUrl, children }: Props) {
  return (
    <div
      dir="rtl"
      lang="fa"
      data-theme="light"
      className="lp-root bg-lp-surface text-lp-ink min-h-screen font-[Vazirmatn,system-ui,sans-serif] [text-wrap:pretty] antialiased"
    >
      {/* Picks the theme before first paint (saved choice, else the device
          theme) so a dark-mode visitor never sees a white flash. Runs ahead of
          hydration, which is why ThemeToggle reads the DOM instead of holding
          React state. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('landing-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)){document.currentScript.parentElement.dataset.theme='dark'}}catch(e){}`,
        }}
      />

      <SiteHeader loginUrl={loginUrl} registerUrl={registerUrl} />
      <main>{children}</main>
      <SiteFooter loginUrl={loginUrl} />
      <MobileCtaBar registerUrl={registerUrl} />
    </div>
  );
}
