import { env } from "@/lib/env";

export function getAdminPanelUrl(path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${env.adminPanelOrigin}${normalized}`;
}
