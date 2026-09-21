'use client';

import { Moon } from 'lucide-react';

import { LANDING } from './landing.messages';

export const THEME_STORAGE_KEY = 'landing-theme';

/**
 * Flips the landing between light and dark. Holds no React state: the root's
 * `data-theme` attribute is the source of truth and CSS picks which icon shows,
 * so the pre-hydration restore script in `landing-shell.tsx` never causes a
 * hydration mismatch.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.querySelector<HTMLElement>('.lp-root');
    if (!root) return;

    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled — the toggle still works for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={LANDING.nav.themeToggle}
      className="border-lp-ink/12 hover:border-lp-ink/30 hidden size-[38px] place-items-center rounded-full border bg-white transition-colors sm:grid"
    >
      <span className="lp-icon-light bg-lp-amber size-[11px] rounded-full shadow-[0_0_0_3px_rgba(240,178,58,.22)]" />
      <Moon size={15} aria-hidden="true" className="lp-icon-dark text-lp-ink" />
    </button>
  );
}
