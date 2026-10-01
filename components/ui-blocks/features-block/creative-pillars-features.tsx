import { cn } from '@/lib/utils';
import { FeaturesBlockProps } from './shared';

// ── Creative (استودیوی خلاق) — 3 pillar cards with tinted icon ────────────────

export const CREATIVE_PILLAR_ICON_TONES = [
  'bg-(--theme-primary-subtle)',
  'bg-(--theme-secondary-subtle)',
  'bg-(--theme-accent-subtle)',
];

export const CREATIVE_PILLARS = [
  {
    icon: '🌟',
    title: 'انگیزه بگیر',
    description:
      'موضوعات پرطرفدار را کشف کن، از مدرسان جواب بگیر، و قبیله خلاقانه خودت را پیدا کن.',
  },
  {
    icon: '🤝',
    title: 'ارتباط بساز',
    description:
      'همتایان و مدرسان را دنبال کن، دیدگاه‌ها را تبادل کن، و از سفر یادگیری همدیگر حمایت کن.',
  },
  {
    icon: '🚀',
    title: 'بساز و رشد کن',
    description:
      'ایده‌های جدید برای پروژه کشف کن، کارت را به اشتراک بذار، و بازخورد واقعی از متخصصان بگیر.',
  },
];

export function CreativePillarsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'همه چیز برای رشد خلاقانه';
  const items = config?.items?.length ? config.items : CREATIVE_PILLARS;

  return (
    <section id={id || 'features'} className="bg-(--theme-background) py-[80px]">
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="text-center text-[22px] font-black text-(--theme-foreground)">{title}</div>
        <div className="mt-[48px] grid gap-[32px] md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-[20px] border-2 border-(--theme-border-color) bg-(--theme-surface) p-[36px] px-[32px] text-center transition-all hover:-translate-y-1 hover:border-(--theme-primary)"
            >
              <div
                className={cn(
                  'mx-auto mb-[20px] flex h-[72px] w-[72px] items-center justify-center rounded-[20px] text-[32px]',
                  CREATIVE_PILLAR_ICON_TONES[i % CREATIVE_PILLAR_ICON_TONES.length],
                )}
              >
                {item.icon}
              </div>
              <h3 className="mb-[10px] text-[17px] font-black text-(--theme-foreground)">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.8] text-(--theme-muted)">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
