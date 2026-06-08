interface MarqueeBlockProps {
  id?: string;
  config?: {
    items?: string[];
  };
}

const DEFAULT_ITEMS = [
  "فیگما",
  "طراحی محصول",
  "ری‌اکت و تایپ‌اسکریپت",
  "استراتژی برند",
  "موشن دیزاین",
  "تحلیل داده",
  "رهبری",
  "ابزارهای نو-کد",
  "استراتژی محتوا",
  "پایتون",
];

export function MarqueeBlock({ id, config }: MarqueeBlockProps) {
  const items = config?.items?.length ? config.items : DEFAULT_ITEMS;
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
