import { buildThemeCssVariables, type ThemeConfigInput } from "@/lib/theme-apply";

const CANVAS_SELECTOR = "[data-theme-canvas]";

/**
 * Repaint the preview's theme in place — the CSS half of "hot reload".
 *
 * The server renders these same variables as an inline style on the canvas
 * wrapper using this exact function, so pushing them here produces precisely
 * what a reload would have produced, minus the reload.
 */
export function applyLiveTheme(
  theme: ThemeConfigInput,
  direction?: "ltr" | "rtl"
): void {
  const canvas = document.querySelector<HTMLElement>(CANVAS_SELECTOR);
  if (!canvas) return;

  for (const [name, value] of Object.entries(buildThemeCssVariables(theme))) {
    canvas.style.setProperty(name, value);
  }
  if (direction) canvas.dir = direction;
}
