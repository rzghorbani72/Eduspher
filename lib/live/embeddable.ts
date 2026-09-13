/**
 * Hosts a meeting link can be embedded from (iframe-friendly, no frame-busting
 * header). Mirrored in Backend's `common/services/meeting-link.service.ts` —
 * keep both in sync when adding a host.
 */
const EMBEDDABLE_HOSTS = ["meet.jit.si", "skyroom.online", "www.skyroom.online"];

export const isEmbeddable = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    return EMBEDDABLE_HOSTS.includes(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
};
