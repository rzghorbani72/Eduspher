module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Semantic color aliases — all map to live CSS variables so every
      // Tailwind utility (bg-*, text-*, border-*, ring-*, shadow-*, etc.)
      // automatically respects the active theme.
      colors: {
        background: 'var(--theme-background)',
        foreground: 'var(--theme-foreground)',
        card: 'var(--theme-card-bg)',
        surface: 'var(--theme-surface)',
        'surface-alt': 'var(--theme-surface-alt)',
        muted: 'var(--theme-muted)',
        primary: 'var(--theme-primary)',
        'on-primary': 'var(--theme-on-primary)',
        secondary: 'var(--theme-secondary)',
        'on-secondary': 'var(--theme-on-secondary)',
        accent: 'var(--theme-accent)',
        'on-accent': 'var(--theme-on-accent)',
        'primary-subtle': 'var(--theme-primary-subtle)',
        'secondary-subtle': 'var(--theme-secondary-subtle)',
        'accent-subtle': 'var(--theme-accent-subtle)',
      },
      borderRadius: {
        theme: 'var(--theme-border-radius, 16px)',
      },
      boxShadow: {
        theme: 'var(--theme-shadow, 0 4px 6px -1px rgba(0,0,0,0.1))',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        // Border utilities — map to the two levels of border intensity
        '.border-theme': { 'border-color': 'var(--theme-border-color)' },
        '.border-theme-strong': { 'border-color': 'var(--theme-border-strong)' },
        // Divide utilities
        '.divide-theme > :not([hidden]) ~ :not([hidden])': {
          'border-color': 'var(--theme-border-color)',
        },
        // Border-radius + shadow shorthands (kept for backwards compat)
        '.rounded-theme': { 'border-radius': 'var(--theme-border-radius, 16px)' },
        '.rounded-l-theme': {
          'border-top-left-radius': 'var(--theme-border-radius, 16px)',
          'border-bottom-left-radius': 'var(--theme-border-radius, 16px)',
        },
        '.rounded-r-theme': {
          'border-top-right-radius': 'var(--theme-border-radius, 16px)',
          'border-bottom-right-radius': 'var(--theme-border-radius, 16px)',
        },
        '.shadow-theme': {
          'box-shadow': 'var(--theme-shadow, 0 4px 6px -1px rgba(0,0,0,0.1))',
        },
      });
    },
  ],
};
