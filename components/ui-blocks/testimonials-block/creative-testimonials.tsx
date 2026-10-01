import { cn } from '@/lib/utils';
import { TestimonialsBlockProps } from './shared';

// ── Creative (استودیوی خلاق) — three avatar cards with amber stars ───────────

export const CREATIVE_TESTI_TONES = [
  'bg-(--theme-primary) text-(--theme-on-primary)',
  'bg-(--theme-accent) text-(--theme-on-accent)',
  'bg-(--theme-secondary) text-(--theme-on-secondary)',
];

export const CREATIVE_TESTI_ITEMS = [
  {
    quote: '«منتوما بهترین تصمیم یادگیری‌ام بود. مهارت‌های واقعی بدون بار مالی تحصیلات سنتی.»',
    name: 'رئوف رضایی',
    role: 'تصویرساز',
    initials: 'ر',
  },
  {
    quote:
      '«دوست دارم جایی باشد که بتوانم با سایر خلاقان ارتباط برقرار کنم و در سفر یادگیری از هم حمایت کنیم.»',
    name: 'الهام ولیزاده',
    role: 'طراح گرافیک',
    initials: 'ا',
  },
  {
    quote:
      '«به ندرت برای چیزی اشتراک می‌گیرم، اما این یکی از اشتراک‌هایی است که نمی‌توانم بدونش تصور کنم.»',
    name: 'کامیار محمدی',
    role: 'طراح UX',
    initials: 'ک',
  },
];

export function CreativeTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || 'چرا دانشجویان منتوما را دوست دارند';
  const items = config?.items?.length ? config.items : CREATIVE_TESTI_ITEMS;

  return (
    <section id={id || 'testimonials'} className="bg-(--theme-background) py-[80px]">
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[40px] text-center text-[22px] font-black text-(--theme-foreground)">
          {title}
        </div>
        <div className="grid gap-[20px] md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-[20px] border-2 border-(--theme-border-color) bg-(--theme-surface) p-[28px]"
            >
              <div className="mb-[14px] text-[16px] tracking-[2px] text-(--theme-accent)">
                ★★★★★
              </div>
              <div className="mb-[20px] text-[14px] leading-[1.8] font-semibold text-(--theme-foreground)">
                {item.quote}
              </div>
              <div className="flex flex-row-reverse items-center justify-end gap-[12px] border-t-2 border-(--theme-border-color) pt-[16px]">
                <div
                  className={cn(
                    'flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full text-[15px] font-black',
                    CREATIVE_TESTI_TONES[i % CREATIVE_TESTI_TONES.length],
                  )}
                >
                  {item.initials}
                </div>
                <div>
                  <div className="text-[14px] font-extrabold text-(--theme-foreground)">
                    {item.name}
                  </div>
                  <div className="text-[12px] font-semibold text-(--theme-muted)">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
