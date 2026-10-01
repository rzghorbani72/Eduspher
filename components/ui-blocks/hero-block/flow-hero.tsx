import Link from '@/components/ui/link';
import { buildAcademyPath, cn, resolveAssetUrl } from '@/lib/utils';
import { AppImage } from '@/components/ui/app-image';
import { FLOW_AVATAR_TONES, HeroBlockProps } from './shared';

export function FlowHero({ id, config, storeContext }: HeroBlockProps) {
  const tag = config?.tag || 'جدید — مسیرهای راهنمایی راه‌اندازی شد';
  const title = config?.title || 'دانش را کشف کن.';
  const titleEm = config?.titleEm || 'هر مهارتی';
  const titleEnd = config?.titleEnd || 'را فتح کن.';
  const subtitle =
    config?.subtitle ||
    'با راهنمایی متخصصان و پروژه‌های عملی، در سرعت خودت یاد بگیر و حرفه‌ات را شتاب بده.';
  const ctaText = config?.ctaText || 'شروع رایگان';
  const ctaSecondary = config?.ctaSecondary || 'مرور دوره‌ها';
  const trustCount = config?.trustCount || '۱۲٬۴۰۰+';
  const avatars = ['آ', 'س', 'م', 'ر', 'ج'];

  const bannerImage = resolveAssetUrl(config?.backgroundImage);
  const card = config?.card ?? {};
  const cardTag = card.tag || 'طراحی';
  const cardTitle = card.title || 'فیگما پیشرفته: از وایرفریم تا پروتوتایپ';
  const cardInstructor = card.instructor || 'توسط سارا چن · ۹ درس';
  const progress = typeof card.progress === 'number' ? card.progress : 68;
  const progressText = card.progressText || '۶۸٪ تکمیل شده · ۴ درس مانده';
  const cardStats = card.stats ?? [
    { label: 'رشته', value: '🔥 ۱۴' },
    { label: 'XP امروز', value: '۳۲۰' },
    { label: 'رتبه', value: '#۴۲' },
  ];

  return (
    <section id={id || 'hero'} className="bg-(--theme-background)">
      <div className="mx-auto grid max-w-[1240px] items-center gap-[60px] px-[48px] pt-[40px] pb-[48px] lg:grid-cols-2">
        {/* Left — copy */}
        <div>
          <div className="mb-[24px] inline-flex items-center gap-2 rounded-full bg-(--theme-primary-subtle) px-[14px] py-[6px] text-[12px] font-bold text-(--theme-primary)">
            <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-(--theme-primary)" />
            {tag}
          </div>
          <h1 className="mb-[20px] text-[clamp(40px,4.5vw,62px)] leading-[1.25] font-black text-(--theme-foreground)">
            {title}
            <br />
            <em className="text-(--theme-primary) not-italic">{titleEm}</em>
            <br />
            {titleEnd}
          </h1>
          <p className="mb-[36px] max-w-[440px] text-[16px] leading-[1.9] text-(--theme-muted)">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-[16px]">
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                '/courses',
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) bg-(--theme-primary) px-[28px] py-[14px] text-[15px] font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90"
            >
              {ctaText}
            </Link>
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                '/courses',
              )}
              className="flex items-center gap-[6px] text-[14px] font-semibold text-(--theme-foreground)"
            >
              <span aria-hidden>←</span>
              {ctaSecondary}
            </Link>
          </div>
          <div className="mt-[48px] flex items-center gap-[16px]">
            <div className="flex flex-row-reverse">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className={cn(
                    '-ms-2 flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 border-(--theme-surface) text-[11px] font-bold first:ms-0',
                    FLOW_AVATAR_TONES[i % FLOW_AVATAR_TONES.length],
                  )}
                >
                  {a}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-0.5 flex gap-0.5">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-[12px] text-(--theme-accent)">
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[13px] font-medium text-(--theme-muted)">
                مورد اعتماد <strong className="text-(--theme-foreground)">{trustCount}</strong>{' '}
                یادگیرنده
              </div>
            </div>
          </div>
        </div>

        {/* Right — progress card */}
        <div className="relative h-[520px]">
          <div className="absolute top-[40px] right-[20px] left-[20px] rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.08)]">
            <div className="relative mb-[16px] flex h-[160px] items-center justify-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-secondary)))]">
              {bannerImage ? (
                <AppImage
                  src={bannerImage}
                  alt={cardTitle}
                  preset="card"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[12px] font-semibold text-white/85">طراحی UX/UI</span>
              )}
            </div>
            <div className="mb-[8px] flex items-center gap-2">
              <span className="rounded-full bg-(--theme-primary-subtle) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-primary)">
                {cardTag}
              </span>
            </div>
            <div className="mb-[6px] text-[15px] font-bold text-(--theme-foreground)">
              {cardTitle}
            </div>
            <div className="mb-[14px] text-[12px] text-(--theme-muted)">{cardInstructor}</div>
            <div className="mb-[6px] h-[4px] overflow-hidden rounded-full bg-(--theme-border-color)">
              <div
                className="h-full rounded-full bg-(--theme-primary)"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-(--theme-muted)">{progressText}</div>
            <div className="mt-[12px] flex gap-[10px]">
              {cardStats.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[10px] border border-(--theme-border-color) bg-(--theme-background) p-[12px]"
                >
                  <div className="mb-1 text-[10px] font-semibold text-(--theme-muted)">
                    {s.label}
                  </div>
                  <div className="text-[18px] font-extrabold text-(--theme-foreground)">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Floating badges */}
          <div className="absolute top-0 left-0 flex items-center gap-[10px] rounded-[12px] border border-(--theme-border-color) bg-(--theme-surface) px-[16px] py-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.1)]">
            <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px] bg-(--theme-primary-subtle) text-[18px]">
              🎓
            </div>
            <div>
              <div className="text-[10px] font-semibold text-(--theme-muted)">
                گواهینامه دریافت شد
              </div>
              <div className="text-[14px] font-extrabold text-(--theme-foreground)">مبانی UX</div>
            </div>
          </div>
          <div className="absolute right-0 bottom-[20px] flex items-center gap-[10px] rounded-[12px] border border-(--theme-border-color) bg-(--theme-surface) px-[16px] py-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.1)]">
            <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px] bg-(--theme-accent-subtle) text-[18px]">
              ⚡
            </div>
            <div>
              <div className="text-[10px] font-semibold text-(--theme-muted)">تازه پیوست</div>
              <div className="text-[14px] font-extrabold text-(--theme-foreground)">
                ۳ یادگیرنده امروز
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
