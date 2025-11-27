import { checkAuth, getUserDisplayName } from "@/app/actions/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  // Get authentication status and display name server-side
  const { isAuthenticated } = await checkAuth();
  const displayName = isAuthenticated ? (await getUserDisplayName()).displayName : null;

  return (
    <SiteHeaderClient 
      displayName={displayName}
      isAuthenticated={isAuthenticated}
    />
  );
}

