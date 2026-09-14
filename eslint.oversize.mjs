// Legacy files above the max-lines limit. This list may only shrink:
// tools/check-oversize-allowlist.mjs fails when a listed file fits the limit again.
export const MAX_LINES = 400;
export const OVERSIZE_ALLOWLIST = [
  'proxy.ts',
  'components/ui-blocks/hero-block.tsx',
  'lib/api/server.ts',
  'lib/api/client.ts',
  'components/ui-blocks/features-block.tsx',
  'components/preview/preview-edit-bridge.tsx',
  'components/ui-blocks/testimonials-block.tsx',
  'components/academy/academy-home-page.tsx',
  'components/auth/register-form.tsx',
  'components/auth/forgot-password-form.tsx',
  'components/motion/creative-background.tsx',
];

// Legacy files still using `any`, `x!` or `console.*`; cleaned as they are split. May only shrink.
export const LEGACY_ANY_ALLOWLIST = [
  'app/actions/auth.ts',
  'app/actions/cart.ts',
  'app/checkout/page.tsx',
  'app/layout.tsx',
  'components/courses/course-live-schedule.tsx',
  'components/motion/scroll-animation-provider.tsx',
  'components/preview/preview-edit-bridge.tsx',
  'components/ui-blocks/blocks-renderer.tsx',
  'components/ui-blocks/hero-slideshow.tsx',
  'lib/api/client.ts',
  'lib/api/server.ts',
  'lib/cart-hybrid.ts',
  'proxy.ts',
];
