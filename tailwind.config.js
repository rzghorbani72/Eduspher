module.exports = {
  darkMode: 'class', // Use class-based dark mode instead of media query
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'theme': 'var(--theme-border-radius, 16px)',
      },
      boxShadow: {
        'theme': 'var(--theme-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.rounded-theme': {
          'border-radius': 'var(--theme-border-radius, 16px)',
        },
        '.rounded-l-theme': {
          'border-top-left-radius': 'var(--theme-border-radius, 16px)',
          'border-bottom-left-radius': 'var(--theme-border-radius, 16px)',
        },
        '.rounded-r-theme': {
          'border-top-right-radius': 'var(--theme-border-radius, 16px)',
          'border-bottom-right-radius': 'var(--theme-border-radius, 16px)',
        },
        '.shadow-theme': {
          'box-shadow': 'var(--theme-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
        },
      });
    },
  ],
}
