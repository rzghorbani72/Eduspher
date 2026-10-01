import { cn } from '@/lib/utils';
import { TestimonialsBlockProps } from './shared';

// ── Flow (منتوما) — three-card grid ────────────────────────────────────────

export const FLOW_AVATAR_TONES = [
  'bg-(--theme-primary) text-(--theme-on-primary)',
  'bg-(--theme-secondary) text-(--theme-on-secondary)',
  'bg-(--theme-accent) text-(--theme-on-accent)',
];

export const FLOW_ITEMS = [
  {
    quote:
      '«دوره‌های منتوما به من کمک کرد اولین نقش UX خودم را در ۴ ماه پیدا کنم. پروژه‌های عملی همه چیز را متفاوت کردند.»',
    name: 'جواد ویلسون',
    role: 'طراح UX در استرایپ',
    initials: 'جو',
  },
  {
    quote:
      '«۳ دوره را در یک ماه تمام کردم. مسیرهای ساختارمند تمرکزم را حفظ کردند و مربیان فوق‌العاده پاسخگو بودند.»',
    name: 'الهام مارتینز',
    role: 'طراح محصول',
    initials: 'اِ',
  },
  {
    quote:
      '«گواهینامه‌ای که از منتوما گرفتم، رزومه‌ام را از فیلتر کارگزین رد کرد. واقعاً ارزشش را دارد.»',
    name: 'داوود لی',
    role: 'سرپرست طراحی در فیگما',
    initials: 'دا',
  },
];

export function FlowTestimonials({ id, config }: TestimonialsBlockProps) {
  const label = config?.label || 'نظر یادگیرندگان';
  const title = config?.title || 'مورد اعتماد هزاران طراح';
  const items = config?.items?.length ? config.items : FLOW_ITEMS;

  return (
    <section id={id || 'testimonials'} className="mx-auto max-w-[1240px] px-[48px] py-[60px]">
      <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
      <div className="text-[clamp(28px,3.5vw,44px)] leading-[1.3] font-extrabold text-(--theme-foreground)">
        {title}
      </div>
      <div className="mt-[36px] grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[28px]"
          >
            <div className="mb-[16px] flex gap-0.5">
              {'★★★★★'.split('').map((s, si) => (
                <span key={si} className="text-[14px] text-(--theme-accent)">
                  {s}
                </span>
              ))}
            </div>
            <div className="mb-[20px] text-[14px] leading-[1.85] font-medium text-(--theme-foreground)">
              {item.quote}
            </div>
            <div className="flex items-center gap-[12px]">
              <div
                className={cn(
                  'flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold',
                  FLOW_AVATAR_TONES[i % FLOW_AVATAR_TONES.length],
                )}
              >
                {item.initials}
              </div>
              <div>
                <div className="text-[13px] font-bold text-(--theme-foreground)">{item.name}</div>
                <div className="text-[12px] text-(--theme-muted)">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
