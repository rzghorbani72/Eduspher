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
  dark_mode?: boolean | null;
  element_animation_style?: string;
  border_radius_style?: string;
  shadow_style?: string;
};

const BORDER_RADIUS_MAP: Record<string, string> = {
  rounded: "16px",
  soft: "24px",
  sharp: "4px",
};

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  strong: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
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

export function hexContrast(hex: string): string {
  const c = hex.replace("#", "");
  const n = parseInt(
    c.length === 3 ? c.split("").map((x) => x + x).join("") : c,
    16
  );
  const luminance =
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255;
  return luminance > 0.5 ? "#0f172a" : "#f8fafc";
}

export function resolveThemeIsDark(
  theme: ThemeConfigInput | null,
  prefersDark = false
): boolean {
  if (!theme || theme.dark_mode === null || theme.dark_mode === undefined) {
    // null/unset → always light mode so edusphere matches the AdminPanel preview
    return false;
  }
  return theme.dark_mode === true;
}

export function buildThemeCssVariables(
  theme: ThemeConfigInput | null,
  options?: { prefersDark?: boolean }
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

  return {
    "--theme-primary": primary,
    "--theme-secondary": secondary,
    "--theme-accent": accent,
    "--theme-background": background,
    "--theme-foreground": foreground,
    "--theme-on-primary": hexContrast(primary),
    "--theme-on-secondary": hexContrast(secondary),
    "--theme-on-accent": hexContrast(accent),
    "--theme-surface": `color-mix(in srgb, ${background} 97%, ${foreground})`,
    "--theme-surface-alt": `color-mix(in srgb, ${primary} 4%, color-mix(in srgb, ${background} 94%, ${foreground}))`,
    "--theme-card-bg": `color-mix(in srgb, ${primary} 7%, ${background})`,
    "--theme-border-color": `color-mix(in srgb, ${foreground} 10%, transparent)`,
    "--theme-border-strong": `color-mix(in srgb, ${foreground} 18%, transparent)`,
    "--theme-muted": `color-mix(in srgb, ${foreground} 55%, ${background})`,
    "--theme-primary-subtle": `color-mix(in srgb, ${primary} 15%, ${background})`,
    "--theme-secondary-subtle": `color-mix(in srgb, ${secondary} 12%, ${background})`,
    "--theme-accent-subtle": `color-mix(in srgb, ${accent} 15%, ${background})`,
    "--theme-border-radius":
      BORDER_RADIUS_MAP[t.border_radius_style || "rounded"] || "16px",
    "--theme-shadow": SHADOW_MAP[t.shadow_style || "medium"] || SHADOW_MAP.medium,
    "--theme-element-animation": t.element_animation_style || "subtle",
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
  options?: { prefersDark?: boolean }
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
