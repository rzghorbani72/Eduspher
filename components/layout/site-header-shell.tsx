"use client";

import { useShell } from "@/components/providers/shell-provider";
import { SiteHeaderClient } from "./site-header-client";

export function SiteHeaderShell() {
  const { isPanelRoot, headerDisplayName, headerIsAuthenticated } = useShell();

  return (
    <SiteHeaderClient
      displayName={headerDisplayName}
      isAuthenticated={headerIsAuthenticated}
      isPanelRoot={isPanelRoot}
    />
  );
}
