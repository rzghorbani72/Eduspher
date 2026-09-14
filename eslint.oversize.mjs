// Legacy files above the max-lines limit. This list may only shrink:
// tools/check-oversize-allowlist.mjs fails when a listed file fits the limit again.
export const MAX_LINES = 400;
export const OVERSIZE_ALLOWLIST = [
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
