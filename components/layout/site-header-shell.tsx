"use client";

import { useShell } from "@/components/providers/shell-provider";
import { SiteHeaderClient } from "./site-header-client";

export function SiteHeaderShell() {
  const {
    isPanelRoot,
    headerDisplayName,
    headerAvatarUrl,
    headerIsAuthenticated,
    requestHost,
  } = useShell();

  return (
    <SiteHeaderClient
      displayName={headerDisplayName}
      avatarUrl={headerAvatarUrl}
      isAuthenticated={headerIsAuthenticated}
      isPanelRoot={isPanelRoot}
      requestHost={requestHost}
    />
  );
}
