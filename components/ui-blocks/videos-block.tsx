import { PlaceholderCard } from "./slot-grid";
import { resolveSlots, type SlotConfig } from "@/lib/slot-config";
import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { resolveAssetUrl } from "@/lib/utils";

export interface VideoItemConfig {
  /** Video row id in the academy's media library. */
  videoId?: string;
  /** Playback source — the public `/videos/stream/:id` route. */
  url?: string;
  poster?: string;
  title?: string;
  description?: string;
}

interface VideosBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    videos?: VideoItemConfig[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

/**
 * Video wall for the academy home page.
 *
 * `preload="none"` is deliberate: the section can hold several videos, and the
 * page is public, so pre-buffering would spend egress on every anonymous visit.
 * Nothing but the poster image loads until a visitor presses play.
 */
export async function VideosBlock({ id, config }: VideosBlockProps) {
  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const tr = (key: string) => t(key, language);

  const videos = (config?.videos ?? []).filter((video) => !!video.url);
  if (videos.length === 0) return null;

  const title =
    config?.text?.title ?? config?.title ?? tr("blocks.videosTitle");
  const subtitle =
    config?.text?.subtitle ?? config?.subtitle ?? tr("blocks.videosSubtitle");

  return (
    <section id={id || "videos"} className="bg-(--theme-background) py-[80px]">
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[56px] text-center">
          <h2 className="mb-[12px] text-[36px] font-black text-(--theme-foreground)">
            {title}
          </h2>
          <p className="mx-auto max-w-[480px] text-[15px] text-(--theme-muted)">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 lg:grid-cols-3">
          {resolveSlots(videos, config?.slots, videos.length).map((slot, i) => {
            if (slot.kind !== "live")
              return <PlaceholderCard key={i} text={slot.text} />;
            const video = slot.data;
            return (
              <figure
                key={video.videoId ?? i}
                className="overflow-hidden rounded-[16px] border border-(--theme-border-color) bg-(--theme-surface)"
              >
                <video
                  src={resolveAssetUrl(video.url) ?? undefined}
                  poster={resolveAssetUrl(video.poster) ?? undefined}
                  controls
                  preload="none"
                  playsInline
                  controlsList="nodownload"
                  className="aspect-video w-full bg-(--theme-surface-alt) object-cover"
                />
                {(video.title || video.description) && (
                  <figcaption className="p-[20px]">
                    {video.title && (
                      <h3 className="mb-[6px] text-[17px] font-bold text-(--theme-foreground)">
                        {video.title}
                      </h3>
                    )}
                    {video.description && (
                      <p className="text-[14px] leading-relaxed text-(--theme-muted)">
                        {video.description}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
