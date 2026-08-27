import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { RichHtml } from "@/components/rich-html";

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
  language?: LanguageCode;
}

export async function CtaBlock({ id, config }: CtaBlockProps) {
  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(currentAcademy?.language || null, currentAcademy?.country_code || null);
  const tr = (key: string) => t(key, language);

  if (config?.style === "creative") return <CreativeCta id={id} config={config} tr={tr} />;

  const label = config?.label || tr("blocks.ctaLabel");
  const title = config?.title || tr("blocks.ctaTitle");
  const subtitle = config?.subtitle || tr("blocks.ctaSubtitle");
  const ctaText = config?.ctaText || tr("blocks.ctaPrimary");
  const ctaSecondary = config?.ctaSecondary || tr("blocks.ctaSecondaryText");

  return (
    <section id={id || "cta"} className="bg-(--theme-surface) py-[60px]">
      <div className="mx-auto max-w-[640px] px-[48px] text-center">
        <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
        <h2 data-editable="title" className="mb-[16px] text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.3] text-(--theme-foreground)">
          {title}
        </h2>
        <RichHtml
          as="p"
          html={subtitle}
          data-editable="subtitle"
          data-editable-kind="rich"
          className="mb-[36px] text-[15px] leading-[1.85] text-(--theme-muted)"
        />
        <div className="flex flex-wrap justify-center gap-[12px]">
          <button
            type="button"
            className="rounded-(--theme-border-radius) bg-(--theme-primary) px-[28px] py-[14px] text-[15px] font-bold text-(--theme-on-primary) hover:opacity-90"
          >
            <span data-editable="ctaText">{ctaText}</span>
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

function CreativeCta({ id, config, tr }: CtaBlockProps & { tr: (key: string) => string }) {
  const title = config?.title || tr("blocks.ctaCreativeTitle");
  const subtitle = config?.subtitle || tr("blocks.ctaCreativeSubtitle");
  const ctaText = config?.ctaText || tr("blocks.ctaCreativePrimary");

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
