import Link from '@/components/ui/link';
import { buildAcademyPath, cn, resolveAssetUrl } from '@/lib/utils';
import { AppImage } from '@/components/ui/app-image';
import { FLOW_AVATAR_TONES, HeroBlockProps } from './shared';

// ── Code (کدیار) — programming academy hero with course card ─────────────────

export function CodeHero({ id, config, storeContext }: HeroBlockProps) {
  const tag = config?.tag || 'بیش از ۵۰۰ دوره تخصصی';
  const title = config?.title || 'برنامه‌نویسی را از';
  const titleEm = config?.titleEm || 'متخصص‌های واقعی';
  const titleEnd = config?.titleEnd || 'یاد بگیر';
  const subtitle =
    config?.subtitle ||
    'دوره‌های جامع و پروژه‌محور برای توسعه‌دهندگان جدی. از مبتدی تا حرفه‌ای، مسیر یادگیری خود را انتخاب کن.';
  const ctaText = config?.ctaText || 'شروع یادگیری ←';
  const ctaSecondary = config?.ctaSecondary || 'مشاهده دوره‌ها';
  const trustCount = config?.trustCount || '+۱۲۰,۰۰۰ دانش‌آموز';
  const trustLabel = config?.trustLabel || 'از سراسر ایران';
  const ratingText = config?.ratingText || '۴.۸ / ۵';
  const ratingLabel = config?.ratingLabel || 'میانگین امتیاز دوره‌ها';
  const liveText = config?.liveText || 'هم‌اکنون ۲۳۴ نفر در حال یادگیری';
  const featuredLabel = config?.featuredLabel || 'دوره پرفروش';
  const featuredTitle = config?.featuredTitle || 'الگوهای پیشرفته React';
  const avatars = ['آ', 'س', 'م', 'ر'];

  const bannerImage = resolveAssetUrl(config?.backgroundImage);
  const card = config?.card ?? {};
  const cardTag = card.tag || 'JavaScript';
  const cardDuration = card.duration || '⏱ ۴۸ ساعت آموزش';
  const cardTitle = card.title || 'JavaScript: از صفر تا مسلط — دوره جامع ۲۰۲۴';
  const cardPrice = card.price || '۱,۲۰۰,۰۰۰ تومان';
  const cardRating = card.rating || '۴.۹';
  const cardRatingCount = card.ratingCount || '(۳,۲۴۱)';
  const cardEnroll = card.enroll || 'ثبت‌نام';

  return (
    <section id={id || 'hero'} className="bg-(--theme-background)">
      <div className="mx-auto grid max-w-[1240px] items-center gap-[60px] px-[48px] pt-[80px] pb-[72px] lg:grid-cols-[1fr_460px]">
        {/* Right (visual) renders second in DOM but RTL places copy first */}
        <div>
          <div className="mb-[22px] inline-flex items-center gap-[7px] rounded-full border border-(--theme-primary)/20 bg-(--theme-primary-subtle) px-[14px] py-[5px] text-[12px] font-bold tracking-[0.04em] text-(--theme-primary)">
            <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-(--theme-primary)" />
            {tag}
          </div>
          <h1 className="mb-[18px] text-[clamp(36px,4vw,56px)] leading-[1.18] font-bold tracking-[-0.02em] text-(--theme-foreground)">
            {title}
            <br />
            <em className="text-(--theme-primary) not-italic">{titleEm}</em>
            <br />
            {titleEnd}
          </h1>
          <p className="mb-[34px] max-w-[450px] text-[16px] leading-[1.85] text-(--theme-muted)">
            {subtitle}
          </p>
          <div className="mb-[44px] flex flex-wrap items-center gap-[14px]">
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
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) border-[1.5px] border-(--theme-border-strong) bg-(--theme-surface-alt) px-[26px] py-[13px] text-[15px] font-semibold text-(--theme-foreground)"
            >
              {ctaSecondary}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-[18px]">
            <div className="flex flex-row-reverse">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className={cn(
                    '-ms-[9px] flex h-[34px] w-[34px] items-center justify-center rounded-full border-[2.5px] border-(--theme-background) text-[11px] font-bold first:ms-0',
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
                  <span key={i} className="text-[13px] text-(--theme-accent)">
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[13px] text-(--theme-muted)">
                <strong className="block font-bold text-(--theme-foreground)">{trustCount}</strong>
                {trustLabel}
              </div>
            </div>
            <div className="h-[28px] w-px bg-(--theme-border-color)" />
            <div className="text-[13px] text-(--theme-muted)">
              <strong className="font-bold text-(--theme-foreground)">{ratingText}</strong>
              <br />
              {ratingLabel}
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative pb-[32px]">
          <div className="absolute -top-[20px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-[12px] bg-(--theme-accent) px-[16px] py-[10px] text-[13px] font-bold whitespace-nowrap text-(--theme-on-accent) shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white/70" />
            {liveText}
          </div>

          <div className="overflow-hidden rounded-[16px] border border-(--theme-border-color) bg-(--theme-card-bg) shadow-[0_24px_72px_rgba(0,0,0,0.15)]">
            <div className="relative flex h-[200px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-secondary)))]">
              {bannerImage ? (
                <AppImage
                  src={bannerImage}
                  alt={cardTitle}
                  preset="card"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[13px] font-semibold text-white/85">{cardTag}</span>
              )}
            </div>
            <div className="px-[20px] pt-[18px] pb-[20px]">
              <div className="mb-[14px] flex items-center gap-[14px]">
                <span className="rounded-[6px] bg-(--theme-primary-subtle) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-primary)">
                  {cardTag}
                </span>
                <span className="text-[12px] text-(--theme-muted)">{cardDuration}</span>
              </div>
              <div className="mb-[8px] text-[16px] font-bold text-(--theme-foreground)">
                {cardTitle}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <div className="text-[18px] font-bold text-(--theme-foreground)">{cardPrice}</div>
                <div className="flex items-center gap-[5px] text-[12px] text-(--theme-muted)">
                  <span className="text-(--theme-accent)">★★★★★</span> {cardRating}{' '}
                  {cardRatingCount}
                </div>
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                    '/courses',
                  )}
                  className="rounded-[8px] bg-(--theme-primary) px-[18px] py-[9px] text-[13px] font-bold text-(--theme-on-primary)"
                >
                  {cardEnroll}
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-[10px] left-[-20px] flex items-center gap-[12px] rounded-[12px] border border-(--theme-border-color) bg-(--theme-surface) px-[16px] py-[12px] whitespace-nowrap shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <span className="text-[22px]">🏆</span>
            <div>
              <div className="text-[11px] text-(--theme-muted)">{featuredLabel}</div>
              <div className="text-[14px] font-bold text-(--theme-foreground)">{featuredTitle}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
