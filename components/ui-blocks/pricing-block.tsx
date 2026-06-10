interface PricingTier {
  tier?: string;
  amount?: string;
  period?: string;
  features?: string[];
  cta?: string;
  featured?: boolean;
  badge?: string;
}

import { PlaceholderCard } from "./slot-grid";
import { resolveSlots, type SlotConfig } from "@/lib/slot-config";
import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

interface PricingBlockProps {
  id?: string;
  config?: {
    label?: string;
    title?: string;
    subtitle?: string;
    tiers?: PricingTier[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    tier: "رایگان",
    amount: "$۰",
    period: "برای همیشه رایگان",
    features: ["۵ دوره رایگان", "دسترسی به جامعه", "پیگیری پیشرفت"],
    cta: "شروع کن",
  },
  {
    tier: "حرفه‌ای",
    amount: "$۱۹",
    period: "ماهانه",
    features: ["دوره‌های نامحدود", "دسترسی به مربی", "گواهینامه‌ها", "مسیرهای یادگیری"],
    cta: "آزمایش رایگان",
    featured: true,
    badge: "محبوب‌ترین",
  },
  {
    tier: "تیمی",
    amount: "$۴۹",
    period: "به ازای هر نفر / ماهانه",
    features: ["همه امکانات حرفه‌ای", "داشبورد تیمی", "پشتیبانی اولویت‌دار"],
    cta: "تماس با فروش",
  },
];

export async function PricingBlock({ id, config }: PricingBlockProps) {
  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(currentAcademy?.language || null, currentAcademy?.country_code || null);
  const tr = (key: string) => t(key, language);

  const label = config?.text?.label ?? config?.label ?? tr("blocks.pricingLabel");
  const title = config?.text?.title ?? config?.title ?? tr("blocks.pricingTitle");
  const subtitle = config?.text?.subtitle ?? config?.subtitle ?? tr("blocks.pricingSubtitle");
  const tiers = config?.tiers?.length ? config.tiers : DEFAULT_TIERS;

  return (
    <section id={id || "pricing"} className="bg-(--theme-primary-subtle) py-[60px]">
      <div className="mx-auto max-w-[960px] px-[48px]">
        <div className="text-center">
          <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
          <div className="mb-[16px] text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.3] text-(--theme-foreground)">
            {title}
          </div>
          <div className="mx-auto max-w-[520px] text-[15px] leading-[1.85] text-(--theme-muted)">{subtitle}</div>
        </div>

        <div className="mt-[36px] grid items-stretch gap-[24px] md:grid-cols-3">
          {resolveSlots(tiers, config?.slots, tiers.length).map((slot, i) => {
            if (slot.kind !== "live") return <PlaceholderCard key={i} text={slot.text} />;
            const tier = slot.data;
            const featured = !!tier.featured;
            return (
              <div
                key={i}
                className={
                  featured
                    ? "relative rounded-(--theme-border-radius) border border-(--theme-secondary) bg-(--theme-secondary) p-[32px] md:scale-[1.04]"
                    : "rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[32px]"
                }
              >
                {featured && tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--theme-primary) px-[16px] py-1 text-[11px] font-bold text-(--theme-on-primary)">
                    {tier.badge}
                  </div>
                )}
                <div
                  className={
                    featured
                      ? "mb-[12px] text-[12px] font-bold text-(--theme-primary)"
                      : "mb-[12px] text-[12px] font-bold text-(--theme-muted)"
                  }
                >
                  {tier.tier}
                </div>
                <div
                  className={
                    featured
                      ? "text-[48px] font-black leading-none text-(--theme-on-secondary)"
                      : "text-[48px] font-black leading-none text-(--theme-foreground)"
                  }
                >
                  {tier.amount}
                </div>
                <div
                  className={
                    featured
                      ? "mb-[24px] text-[13px] text-(--theme-on-secondary)/70"
                      : "mb-[24px] text-[13px] text-(--theme-muted)"
                  }
                >
                  {tier.period}
                </div>
                <ul className="mb-[28px] flex flex-col gap-[10px]">
                  {(tier.features ?? []).map((f, fi) => (
                    <li
                      key={fi}
                      className={
                        featured
                          ? "flex items-center gap-[10px] text-[13px] text-(--theme-on-secondary)/85"
                          : "flex items-center gap-[10px] text-[13px] text-(--theme-foreground)"
                      }
                    >
                      <span className="font-bold text-(--theme-primary)">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={
                    featured
                      ? "w-full rounded-(--theme-border-radius) border-2 border-(--theme-primary) bg-(--theme-primary) py-[13px] text-[14px] font-bold text-(--theme-on-primary)"
                      : "w-full rounded-(--theme-border-radius) border-2 border-(--theme-foreground)/70 bg-transparent py-[13px] text-[14px] font-bold text-(--theme-foreground) transition-colors hover:bg-(--theme-foreground) hover:text-(--theme-background)"
                  }
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
