// Visitor-chosen light/dark override, used only when the theme's dark_mode is
// null ("both"/auto). Persisted so the choice survives reloads, and broadcast
// via a window event so every theme applier re-runs together.
export const THEME_MODE_EVENT = 'academy-theme-mode-change';
const STORAGE_KEY = 'academy-theme-mode';

export type ThemeMode = 'light' | 'dark';

export function readThemeModeOverride(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'dark' || value === 'light' ? value : null;
}

export function writeThemeModeOverride(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new Event(THEME_MODE_EVENT));
}
