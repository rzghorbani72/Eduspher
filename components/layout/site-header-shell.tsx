'use client';

import { useShell } from '@/components/providers/shell-provider';
import { SiteHeaderClient } from './site-header-client';

/**
 * `previewMode` is the editor render: it always shows the logged-out auth
 * button, so a manager previewing their site sees the control their visitors
 * see instead of their own account chip.
 */
export function SiteHeaderShell({ previewMode = false }: { previewMode?: boolean }) {
  const { isPanelRoot, headerDisplayName, headerAvatarUrl, headerIsAuthenticated, requestHost } =
    useShell();

  return (
    <SiteHeaderClient
      displayName={headerDisplayName}
      avatarUrl={headerAvatarUrl}
      isAuthenticated={previewMode ? false : headerIsAuthenticated}
      isPanelRoot={isPanelRoot}
      requestHost={requestHost}
    />
  );
}
