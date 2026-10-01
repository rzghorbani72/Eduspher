// Legacy files above the max-lines limit. This list may only shrink:
// tools/check-oversize-allowlist.mjs fails when a listed file fits the limit again.
export const MAX_LINES = 400;
export const OVERSIZE_ALLOWLIST = ['components/preview/preview-edit-bridge.tsx', 'proxy.ts'];

// Legacy files still using `any`, `x!` or `console.*`; cleaned as they are split. May only shrink.
export const LEGACY_ANY_ALLOWLIST = [
  'app/actions/auth.ts',
  'app/actions/cart.ts',
  'app/checkout/page.tsx',
  'app/layout.tsx',
  'components/courses/course-live-schedule.tsx',
  'components/motion/scroll-animation-provider.tsx',
  'components/preview/dom/list-helpers.ts',
  'components/preview/dom/media-buttons.ts',
  'components/preview/dom/toolbar-and-paths.ts',
  'components/preview/preview-edit-bridge.tsx',
  'components/ui-blocks/blocks-renderer.tsx',
  'components/ui-blocks/hero-slideshow.tsx',
  'lib/api/client/core.ts',
  'lib/api/server/site-theme.ts',
  'lib/cart-hybrid.ts',
  'lib/proxy/parts/embed-and-jwt.ts',
];
