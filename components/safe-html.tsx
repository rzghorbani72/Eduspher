'use client';

import { useEffect, useState } from 'react';
import { sanitizeRichText } from '@/lib/sanitize';

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
  const [clean, setClean] = useState('');

  useEffect(() => {
    setClean(sanitizeRichText(html || ''));
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
