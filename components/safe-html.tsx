'use client';

import { useSyncExternalStore } from 'react';
import { sanitizeRichText } from '@/lib/sanitize';

const subscribeNoop = () => () => {};

/**
 * Renders untrusted rich-text (article / lesson body) safely.
 *
 * DOMPurify only works in the browser — on the Node server it returns the input
 * UNCHANGED, so sanitizing inside a server component would emit raw HTML and any
 * `<script>` would execute on load. This client component renders nothing during
 * SSR and only injects the DOMPurify-sanitized HTML after it mounts in the
 * browser, so unsanitized markup never reaches the document.
 */
export function SafeHtml({ html, className }: { html: string; className?: string }) {
  // Render nothing during SSR (DOMPurify is a no-op on the server); only after
  // hydration do we inject the sanitized HTML — no setState-in-effect needed.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const clean = hydrated ? sanitizeRichText(html || '') : '';

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
