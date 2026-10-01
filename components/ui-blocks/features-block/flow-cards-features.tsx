import { FeaturesBlockProps } from './shared';

// ── Flow (منتوما) — "why" card grid ────────────────────────────────────────

export const FLOW_WHY_ITEMS = [
  {
    icon: '📐',
    title: 'تمرکز بر عمل',
    description:
      'هر دوره شامل پروژه‌های واقعی و تمرین‌هایی است که یادگیری را به مهارت‌های پایدار تبدیل می‌کند.',
  },
  {
    icon: '⏱',
    title: 'با سرعت خودت یاد بگیر',
    description:
      'دروس کوچک متناسب با برنامه‌ات. دقیقاً از همان‌جا که ماندی ادامه بده، از هر دستگاهی.',
  },
  {
    icon: '🏅',
    title: 'گواهینامه کسب کن',
    description: 'با گواهینامه‌های تأییدشده برای هر دوره تکمیل‌شده، مستقیم به لینکدین اضافه کن.',
  },
  {
    icon: '🧑‍🏫',
    title: 'مربیان متخصص',
    description: 'از متخصصانی یاد بگیر که در شرکت‌های برتر کار می‌کنند و تجربه میدانی دارند.',
  },
  {
    icon: '🗺',
    title: 'مسیرهای ساختارمند',
    description: 'مسیرهای یادگیری طراحی‌شده که تو را از صفر تا آماده‌ی کار می‌رسانند بدون سردرگمی.',
  },
  {
    icon: '👥',
    title: 'جامعه فعال',
    description: 'به جامعه ۱۲٬۰۰۰+ یادگیرنده بپیوند. کارت را به اشتراک بذار، بازخورد بگیر، رشد کن.',
  },
];

export function FlowCardsFeatures({ id, config }: FeaturesBlockProps) {
  const label = config?.label || 'چرا منتوما';
  const title = config?.title || 'همه آنچه برای رشد مهارت‌هایت نیاز داری';
  const subtitle =
    config?.subtitle ||
    'مسیرهای یادگیری ساختارمند، مربیان متخصص، و جامعه‌ای که در هر قدم مسئولیت‌پذیرت نگه می‌دارد.';
  const items = config?.items?.length ? config.items : FLOW_WHY_ITEMS;

  return (
    <section id={id || 'features'} className="mx-auto max-w-[1240px] px-[48px] py-[60px]">
      <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
      <div className="grid items-end gap-[16px] md:grid-cols-2">
        <div className="text-[clamp(28px,3.5vw,44px)] leading-[1.3] font-extrabold text-(--theme-foreground)">
          {title}
        </div>
        <div className="max-w-[520px] text-[15px] leading-[1.85] text-(--theme-muted)">
          {subtitle}
        </div>
      </div>
      <div className="mt-[36px] grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[32px] transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="mb-[20px] flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-(--theme-primary-subtle) text-[22px]">
              {item.icon}
            </div>
            <h3 className="mb-[8px] text-[15px] font-bold text-(--theme-foreground)">
              {item.title}
            </h3>
            <p className="text-[13px] leading-[1.8] text-(--theme-muted)">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
