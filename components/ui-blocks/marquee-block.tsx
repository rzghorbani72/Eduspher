import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

interface MarqueeBlockProps {
  id?: string;
  config?: {
    items?: string[];
  };
}

export async function MarqueeBlock({ id, config }: MarqueeBlockProps) {
  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(currentAcademy?.language || null, currentAcademy?.country_code || null);
  const tr = (key: string) => t(key, language);

  const defaultItems = [
    tr("blocks.marqueeItem1"),
    tr("blocks.marqueeItem2"),
    tr("blocks.marqueeItem3"),
    tr("blocks.marqueeItem4"),
    tr("blocks.marqueeItem5"),
    tr("blocks.marqueeItem6"),
    tr("blocks.marqueeItem7"),
    tr("blocks.marqueeItem8"),
    tr("blocks.marqueeItem9"),
    tr("blocks.marqueeItem10"),
  ];

  const items = config?.items?.length ? config.items : defaultItems;
  // Render the set twice so the -50%→0 track loops seamlessly.
  const loop = [...items, ...items];

  return (
    <section
      id={id || "marquee"}
      className="overflow-hidden border-y border-(--theme-border-color) bg-(--theme-surface) py-[20px]"
    >
      <div className="flow-marquee-track flex w-max items-center gap-[48px]">
        {loop.map((label, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap text-[15px] font-bold text-(--theme-foreground)/40"
          >
            {label}
            <span className="h-[5px] w-[5px] rounded-full bg-(--theme-foreground)/40" />
          </div>
        ))}
      </div>
    </section>
  );
}
