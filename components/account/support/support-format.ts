import type { TicketMessageView, TicketStatus } from "@/lib/api/client";
import { backendApiBaseUrl } from "@/lib/env";

type Translate = (key: string) => string;

/** Build the backend retrieval URL for an attachment image. */
export function attachmentUrl(imageId: string): string {
  return `${backendApiBaseUrl}/images/get-image?id=${encodeURIComponent(imageId)}`;
}

/** Localized text for a SYSTEM_EVENT message (e.g. responsible changed). */
export function formatSystemEvent(message: TicketMessageView, t: Translate): string {
  const meta = message.system_meta ?? {};
  const fill = (key: string) =>
    t(key)
      .replace("{from}", meta.from_name ?? "—")
      .replace("{to}", meta.to_name ?? "—")
      .replace("{by}", meta.by_name ?? "—");

  if (message.system_event_type === "reassigned") {
    return meta.from_name ? fill("support.responsibleChanged") : fill("support.responsibleAssigned");
  }
  return t("support.callRequested");
}

export function statusBadgeVariant(status: TicketStatus): "default" | "soft" | "success" | "warning" {
  if (status === "RESOLVED" || status === "CLOSED") return "success";
  if (status === "WAITING_ON_USER") return "warning";
  if (status === "OPEN" || status === "REOPENED") return "default";
  return "soft";
}
