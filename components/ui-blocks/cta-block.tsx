interface CtaBlockProps {
  id?: string;
  config?: {
    label?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaSecondary?: string;
    style?: "default" | "creative";
  };
}

export function CtaBlock({ id, config }: CtaBlockProps) {
  if (config?.style === "creative") return <CreativeCta id={id} config={config} />;

  const label = config?.label || "همین امروز شروع کن";
  const title = config?.title || "یادگیری را شروع کن. رشد کن.";
  const subtitle =
    config?.subtitle ||
    "به ۱۲٬۰۰۰+ یادگیرنده‌ای بپیوند که با دوره‌های متخصص‌محور منتوریار مهارت‌های واقعی می‌سازند.";
  const ctaText = config?.ctaText || "رایگان بپیوند";
  const ctaSecondary = config?.ctaSecondary || "مرور دوره‌ها";

  return (
    <section id={id || "cta"} className="bg-(--theme-surface) py-[60px]">
      <div className="mx-auto max-w-[640px] px-[48px] text-center">
        <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
        <h2 className="mb-[16px] text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.3] text-(--theme-foreground)">
          {title}
        </h2>
        <p className="mb-[36px] text-[15px] leading-[1.85] text-(--theme-muted)">{subtitle}</p>
        <div className="flex flex-wrap justify-center gap-[12px]">
          <button
            type="button"
            className="rounded-(--theme-border-radius) bg-(--theme-primary) px-[28px] py-[14px] text-[15px] font-bold text-(--theme-on-primary) hover:opacity-90"
          >
            {ctaText}
          </button>
          <button
            type="button"
            className="rounded-(--theme-border-radius) border-[1.5px] border-(--theme-border-color) px-[24px] py-[13px] text-[14px] font-semibold text-(--theme-foreground)"
          >
            {ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Creative (استودیوی خلاق) — green band with navy button ────────────────────

function CreativeCta({ id, config }: CtaBlockProps) {
  const title = config?.title || "همین امروز شروع به ساختن کن.";
  const subtitle = config?.subtitle || "دسترسی نامحدود به ۳۰٬۰۰۰+ کلاس. ۷ روز رایگان، هر زمان لغو کن.";
  const ctaText = config?.ctaText || "← آزمایش رایگان";

  return (
    <section id={id || "cta"} className="bg-(--theme-primary) px-[40px] py-[80px] text-center">
      <h2 className="mb-[16px] text-[40px] font-black text-(--theme-secondary)">{title}</h2>
      <p className="mb-[36px] text-[16px] text-(--theme-secondary)/75">{subtitle}</p>
      <button
        type="button"
        className="rounded-(--theme-border-radius) bg-(--theme-secondary) px-[40px] py-[16px] text-[15px] font-black text-(--theme-on-secondary) transition-opacity hover:opacity-90"
      >
        {ctaText}
      </button>
    </section>
  );
}
