import Link from '@/components/ui/link';
import { buildAcademyPath, cn } from '@/lib/utils';
import { HeroBlockProps } from './shared';

// ── Creative (استودیوی خلاق) — navy hero with 2×2 class cards + stats ─────────

export const CREATIVE_THUMB_GRADIENTS = [
  'bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-secondary)))]',
  'bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_55%,var(--theme-primary)))]',
  'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-primary)_70%,var(--theme-accent)),var(--theme-secondary))]',
  'bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-primary)_60%,var(--theme-secondary)))]',
];

export const CREATIVE_STATS = [
  { value: '۴۲۵هزار+', label: 'عضو' },
  { value: '۳۰هزار+', label: 'کلاس' },
  { value: '۹هزار+', label: 'مدرس' },
  { value: '۴.۸★', label: 'امتیاز اپ' },
];

export function CreativeHero({ id, config, storeContext }: HeroBlockProps) {
  const tag = config?.tag || '🎨 جامعه یادگیری خلاق';
  const title = config?.title || 'کلاس‌های خلاقانه از بهترین';
  const titleEm = config?.titleEm || 'متخصصان';
  const titleEnd = config?.titleEnd || 'صنعت';
  const subtitle =
    config?.subtitle ||
    'هزاران کلاس در تصویرسازی، طراحی، عکاسی، فیلم، فریلنسری و بیشتر. به جامعه خلاقان بپیوند.';
  const ctaText = config?.ctaText || 'آزمایش رایگان شروع کن';
  const ctaSecondary = config?.ctaSecondary || 'کشف کلاس‌ها';
  const stats = config?.stats?.length
    ? config.stats
    : storeContext?.stats
      ? [
          storeContext.stats.studentCount > 0
            ? {
                value: `${storeContext.stats.studentCount.toLocaleString('fa-IR')}+`,
                label: 'دانشجو',
              }
            : null,
          storeContext.stats.courseCount > 0
            ? {
                value: `${storeContext.stats.courseCount.toLocaleString('fa-IR')}+`,
                label: 'دوره',
              }
            : null,
        ].filter((s): s is { value: string; label: string } => s !== null)
      : CREATIVE_STATS;
  // Mini-cards only from config — do not show fake placeholder courses
  const miniCards = config?.miniCards?.length ? config.miniCards : [];

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-secondary) text-(--theme-on-secondary)"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[20px] right-[55%] h-[120px] w-[120px] rounded-full bg-(--theme-primary) opacity-[0.18]" />
        <div className="absolute top-[30%] left-[5%] h-[80px] w-[80px] rounded-full bg-(--theme-accent) opacity-[0.18]" />
        <div className="absolute -bottom-[60px] left-[15%] h-[200px] w-[200px] rounded-full bg-(--theme-primary) opacity-[0.12]" />
      </div>

      <div className="relative z-[2] mx-auto grid max-w-[1200px] items-center gap-[60px] px-[40px] py-[80px] lg:grid-cols-2">
        {/* Copy */}
        <div>
          <div className="mb-[24px] inline-flex items-center gap-2 rounded-full border-[1.5px] border-(--theme-primary)/40 bg-(--theme-primary)/20 px-[14px] py-[6px] text-[12px] font-extrabold text-(--theme-primary)">
            {tag}
          </div>
          <h1 className="mb-[20px] text-[clamp(32px,4.5vw,56px)] leading-[1.2] font-black text-(--theme-on-secondary)">
            {title} <em className="text-(--theme-primary) not-italic">{titleEm}</em> {titleEnd}
          </h1>
          <p className="mb-[36px] max-w-[440px] text-[16px] leading-[1.85] text-(--theme-on-secondary)/75">
            {subtitle}
          </p>
          <div className="mb-[40px] flex flex-wrap gap-[12px]">
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                '/courses',
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) bg-(--theme-primary) px-[32px] py-[14px] text-[15px] font-extrabold text-(--theme-secondary) transition-opacity hover:opacity-90"
            >
              {ctaText}
            </Link>
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                '/courses',
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) border-2 border-(--theme-on-secondary)/30 px-[32px] py-[12px] text-[15px] font-extrabold text-(--theme-on-secondary) transition-colors hover:border-(--theme-on-secondary)/70"
            >
              {ctaSecondary}
            </Link>
          </div>
          <div className="flex flex-wrap gap-[32px]">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-[26px] font-black text-(--theme-on-secondary)">{s.value}</div>
                <div className="text-[12px] font-semibold text-(--theme-on-secondary)/65">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2×2 mini class cards */}
        <div className="grid grid-cols-2 gap-[16px]">
          {miniCards.map((c, i) => (
            <div
              key={i}
              className={cn(
                'rounded-[16px] border-[1.5px] border-(--theme-on-secondary)/15 bg-(--theme-on-secondary)/[0.06] p-[20px]',
                i % 2 === 1 && 'mt-[24px]',
              )}
            >
              <div
                className={cn(
                  'mb-[14px] h-[88px] rounded-[10px]',
                  CREATIVE_THUMB_GRADIENTS[i % CREATIVE_THUMB_GRADIENTS.length],
                )}
              />
              <div className="mb-[4px] text-[13px] font-extrabold text-(--theme-on-secondary)">
                {c.title}
              </div>
              <div className="text-[11px] font-bold text-(--theme-primary)">{c.instructor}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
