export type ThemeConfigInput = {
  primary_color?: string;
  primary_color_light?: string;
  primary_color_dark?: string;
  secondary_color?: string;
  secondary_color_light?: string;
  secondary_color_dark?: string;
  accent_color?: string;
  background_color?: string;
  background_color_light?: string;
  background_color_dark?: string;
  // The API may return dark_mode as a real boolean OR the string "true"/"false"
  // /"null" — resolveThemeIsDark normalizes both shapes.
  dark_mode?: boolean | string | null;
  element_animation_style?: string;
  border_radius_style?: string;
  shadow_style?: string;
  font_family?: string;
  section_spacing?: string;
  container_width?: string;
  heading_scale?: string;
};

const BORDER_RADIUS_MAP: Record<string, string> = {
  rounded: "16px",
  soft: "24px",
  sharp: "4px",
};

// Slug → CSS font stack. Mirrors Backend theme-css.util.ts; only mapped values
// are emitted, so an unknown slug can never break out of the <style> block.
const FONT_STACK_MAP: Record<string, string> = {
  // Persian / Arabic
  vazirmatn: "'Vazirmatn', system-ui, sans-serif",
  markazi: "'Markazi Text', 'Vazirmatn', serif",
  "noto-naskh": "'Noto Naskh Arabic', 'Vazirmatn', serif",
  lalezar: "'Lalezar', 'Vazirmatn', cursive",
  // Latin / English
  inter: "'Inter', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
};
const DEFAULT_FONT_STACK = FONT_STACK_MAP.vazirmatn;

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  medium:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  strong:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
};

// Motion presets. A string CSS variable cannot be branched on in plain CSS, so
// the manager's choice is emitted as NUMBERS the stylesheet can use directly.
// Looking the value up here also sanitizes it: this string is interpolated into
// a served <style> block, so an unmapped value must never reach the output.
const ELEMENT_ANIMATION_MAP: Record<
  string,
  { distance: string; duration: string; stagger: string }
> = {
  none: { distance: "0px", duration: "0ms", stagger: "0ms" },
  subtle: { distance: "10px", duration: "420ms", stagger: "60ms" },
  moderate: { distance: "20px", duration: "560ms", stagger: "90ms" },
  dynamic: { distance: "34px", duration: "720ms", stagger: "120ms" },
};

// Design-system size tokens. These map the manager's coarse choices onto the
// CSS vars that globals.css already consumes (.ui-blocks-root rules), so a size
// change applies uniformly to every section regardless of its source template.
const SECTION_SPACING_MAP: Record<string, string> = {
  compact: "2.5rem",
  comfortable: "4rem",
  spacious: "6rem",
};
const CONTAINER_WIDTH_MAP: Record<string, string> = {
  narrow: "960px",
  standard: "1120px",
  wide: "1320px",
  full: "100%",
};
const HEADING_SCALE_MAP: Record<
  string,
  { sm: string; md: string; lg: string }
> = {
  compact: { sm: "1.25rem", md: "1.875rem", lg: "2.5rem" },
  standard: { sm: "1.5rem", md: "2.25rem", lg: "3rem" },
  large: { sm: "1.875rem", md: "2.75rem", lg: "3.75rem" },
};

export const DEFAULT_PLATFORM_THEME: ThemeConfigInput = {
  primary_color: "#3b82f6",
  secondary_color: "#6366f1",
  accent_color: "#f59e0b",
  background_color: "#f8fafc",
  background_color_light: "#f8fafc",
  background_color_dark: "#0f172a",
  dark_mode: false,
  border_radius_style: "rounded",
  shadow_style: "medium",
  element_animation_style: "subtle",
};

function relativeLuminance(hex: string): number {
  const c = hex.replace("#", "");
  const n = parseInt(
    c.length === 3
      ? c
          .split("")
          .map((x) => x + x)
          .join("")
      : c,
    16,
  );
  return (
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255
  );
}

export function hexContrast(hex: string): string {
  return relativeLuminance(hex) > 0.5 ? "#0f172a" : "#f8fafc";
}

/**
 * Button text prefers white, and switches to dark once the button colour is
 * bright enough that white stops being readable on it. The old cut-off was 0.8
 * — near-white only — so a pale brand colour (lavender, mint, light amber) kept
 * white text at roughly 2:1 contrast. 0.6 catches those while leaving mid-tone
 * blues and greens, where white still reads well, on white.
 */
export function buttonTextContrast(hex: string): string {
  return relativeLuminance(hex) > 0.6 ? "#0f172a" : "#f8fafc";
}

export function resolveThemeIsDark(
  theme: ThemeConfigInput | null,
   
  _prefersDark = false,
): boolean {
  const dm = theme?.dark_mode;
  // Light is the default for every template; dark is opt-in. When the manager
  // picks "both", the visitor's explicit toggle is applied upstream (it sets an
  // explicit dark_mode), so an unset value here always resolves to light.
  if (dm === null || dm === undefined || dm === "null") return false;
  if (typeof dm === "string") return dm === "true" || dm === "1";
  return dm === true;
}

export function buildThemeCssVariables(
  theme: ThemeConfigInput | null,
  options?: { prefersDark?: boolean },
): Record<string, string> {
  const t = { ...DEFAULT_PLATFORM_THEME, ...theme };
  const isDark = resolveThemeIsDark(theme, options?.prefersDark ?? false);

  const primary = isDark
    ? t.primary_color_dark || t.primary_color || "#60a5fa"
    : t.primary_color_light || t.primary_color || "#3b82f6";
  const secondary = isDark
    ? t.secondary_color_dark || t.secondary_color || "#818cf8"
    : t.secondary_color_light || t.secondary_color || "#6366f1";
  const background = isDark
    ? t.background_color_dark || t.background_color || "#0f172a"
    : t.background_color_light || t.background_color || "#f8fafc";
  const accent = t.accent_color || "#f59e0b";
  const foreground = hexContrast(background);
  const heading =
    HEADING_SCALE_MAP[t.heading_scale || "standard"] ||
    HEADING_SCALE_MAP.standard;

  const animationStyle = String(t.element_animation_style || "subtle");
  const motion =
    ELEMENT_ANIMATION_MAP[animationStyle] || ELEMENT_ANIMATION_MAP.subtle;

  return {
    "--theme-primary": primary,
    "--theme-secondary": secondary,
    "--theme-accent": accent,
    "--theme-background": background,
    "--theme-foreground": foreground,
    "--theme-on-primary": buttonTextContrast(primary),
    "--theme-on-secondary": buttonTextContrast(secondary),
    "--theme-on-accent": buttonTextContrast(accent),
    "--theme-surface": `color-mix(in srgb, ${background} 97%, ${foreground})`,
    "--theme-surface-alt": `color-mix(in srgb, ${primary} 4%, color-mix(in srgb, ${background} 94%, ${foreground}))`,
    "--theme-card-bg": `color-mix(in srgb, ${primary} 7%, ${background})`,
    "--theme-border-color": `color-mix(in srgb, ${foreground} 10%, transparent)`,
    "--theme-border-strong": `color-mix(in srgb, ${foreground} 18%, transparent)`,
    "--theme-muted": `color-mix(in srgb, ${foreground} 55%, ${background})`,
    "--theme-primary-subtle": `color-mix(in srgb, ${primary} 15%, ${background})`,
    // Primary as TEXT on a light/neutral surface. A pale brand colour fails
    // contrast when printed straight onto the background, so the ink variant is
    // pulled toward the foreground — which darkens it on light themes and
    // brightens it on dark ones.
    "--theme-primary-ink": `color-mix(in srgb, ${primary} 62%, ${foreground})`,
    "--theme-secondary-subtle": `color-mix(in srgb, ${secondary} 12%, ${background})`,
    "--theme-accent-subtle": `color-mix(in srgb, ${accent} 15%, ${background})`,
    // Dark anchor band. Every new template inverts at least one section onto a
    // near-black surface; deriving it (instead of trusting the raw secondary)
    // guarantees the band stays dark even when a manager picks a pale colour.
    "--theme-deep": `color-mix(in srgb, ${secondary} 22%, #0a0d12)`,
    "--theme-on-deep": "#f4f6fa",
    // Secondary body text — softer than foreground, stronger than muted.
    "--theme-ink-2": `color-mix(in srgb, ${foreground} 78%, ${background})`,
    // Thin structural rule used by the editorial templates.
    "--theme-hairline": `color-mix(in srgb, ${foreground} 14%, transparent)`,
    "--theme-border-radius":
      BORDER_RADIUS_MAP[t.border_radius_style || "rounded"] || "16px",
    "--theme-shadow":
      SHADOW_MAP[t.shadow_style || "medium"] || SHADOW_MAP.medium,
    "--theme-element-animation": ELEMENT_ANIMATION_MAP[animationStyle]
      ? animationStyle
      : "subtle",
    "--theme-motion-distance": motion.distance,
    "--theme-motion-duration": motion.duration,
    "--theme-motion-stagger": motion.stagger,
    "--theme-font-family":
      FONT_STACK_MAP[t.font_family || "vazirmatn"] || DEFAULT_FONT_STACK,
    "--theme-section-padding-y":
      SECTION_SPACING_MAP[t.section_spacing || "comfortable"] || "4rem",
    "--theme-container-max-width":
      CONTAINER_WIDTH_MAP[t.container_width || "standard"] || "1120px",
    "--theme-heading-size-sm": heading.sm,
    "--theme-heading-size-md": heading.md,
    "--theme-heading-size-lg": heading.lg,
  };
}

export function themeCssVariablesToBlock(vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
  return `:root {\n  ${body}\n}`;
}

export function applyThemeCssVariables(
  theme: ThemeConfigInput | null,
  options?: { prefersDark?: boolean },
): void {
  if (typeof document === "undefined") return;

  const prefersDark =
    options?.prefersDark ??
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ??
    false;
  const vars = buildThemeCssVariables(theme, { prefersDark });
  const root = document.documentElement;

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  const background = vars["--theme-background"];
  const foreground = vars["--theme-foreground"];
  document.body.style.backgroundColor = background;
  document.body.style.color = foreground;

  const isDark = resolveThemeIsDark(theme, prefersDark);
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
