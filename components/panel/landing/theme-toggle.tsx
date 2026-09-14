'use client';

import { Moon, Sun } from 'lucide-react';

import { LANDING } from './landing.messages';

export const THEME_STORAGE_KEY = 'landing-theme';

/**
 * Flips the landing between light and dark.
 *
 * Deliberately holds no React state: the root's `data-theme` attribute is the
 * single source of truth, both icons are always rendered and CSS picks which one
 * shows. That avoids a setState-in-effect cascade and, more importantly, avoids
 * a hydration mismatch — the inline restore script in `landing-page.tsx` may set
 * the attribute before React hydrates.
 *
 * Every landing colour is a `--color-lp-*` variable, so flipping the attribute
 * re-themes the whole page without a single `dark:` variant.
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
      className="border-lp-line text-lp-ink-2 hover:text-lp-ink grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors"
    >
      <Sun size={17} aria-hidden="true" className="lp-icon-light" />
      <Moon size={17} aria-hidden="true" className="lp-icon-dark" />
    </button>
  );
}
