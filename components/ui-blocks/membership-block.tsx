import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { buildAcademyPath } from "@/lib/utils";

interface MembershipBlockProps {
  id?: string;
  config?: {
    tag?: string;
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    features?: string[];
    ctaText?: string;
    price?: string;
    period?: string;
    planItems?: string[];
    planCtaText?: string;
    guarantee?: string;
  };
  storeContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
}

const DEFAULTS = {
  tag: "اشتراک ویژه",
  title: "دسترسی نامحدود به",
  titleHighlight: "تمام دوره‌ها",
  subtitle:
    "با یک اشتراک مقرون‌به‌صرفه، به تمام ۵۰۰+ دوره دسترسی داشته باشید و با سرعت دلخواه یاد بگیرید.",
  features: [
    "دسترسی به تمام دوره‌های موجود و آینده",
    "دانلود ویدیوها برای مشاهده آفلاین",
    "پشتیبانی ۲۴ ساعته و انجمن اختصاصی",
    "گواهینامه معتبر پس از اتمام دوره",
  ],
  ctaText: "همین امروز شروع کن",
  price: "۱۸۰,۰۰۰",
  period: "تومان / ماهانه",
  planItems: [
    "دسترسی کامل به ۵۰۰+ دوره",
    "گواهینامه رسمی برای هر دوره",
    "پروژه‌های عملی و مربی اختصاصی",
    "انجمن اختصاصی و کدریویو",
    "بدون تبلیغات",
  ],
  planCtaText: "شروع رایگان ۷ روزه",
  guarantee: "بدون نیاز به کارت بانکی • لغو هر زمان",
};

const sectionStyle = {
  background:
    "linear-gradient(135deg, #0b1020 0%, color-mix(in srgb, var(--theme-primary) 55%, #0b1020) 55%, var(--theme-primary) 100%)",
};

export function MembershipBlock({ id, config, storeContext }: MembershipBlockProps) {
  const c = { ...DEFAULTS, ...config };
  const pricingHref = buildAcademyPath(storeContext?.slug ?? null, "/pricing");

  return (
    <section id={id || "membership"} className="py-20 sm:py-24 text-white" style={sectionStyle}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p data-scroll-animate="fadeIn" className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-white/50">
            {c.tag}
          </p>
          <h2 data-scroll-animate="slideRight" className="text-3xl font-bold leading-tight sm:text-4xl">
            {c.title}
            {c.titleHighlight && (
              <>
                <br />
                <span style={{ color: "var(--theme-primary-light, #60A5FA)" }}>{c.titleHighlight}</span>
              </>
            )}
          </h2>
          <p data-scroll-animate="slideRight" data-scroll-delay="0.1" className="mt-4 max-w-lg text-base leading-relaxed text-white/65">
            {c.subtitle}
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {c.features.map((f, i) => (
              <li key={i} data-scroll-animate="fadeInUp" data-scroll-delay={`${0.06 * i}`} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Button size="lg" asChild className="mt-9 rounded-xl bg-white px-8 font-bold text-gray-900 hover:bg-white/90">
            <Link href={pricingHref}>{c.ctaText}</Link>
          </Button>
        </div>

        <div data-scroll-animate="slideLeft" className="rounded-2xl border border-white/15 bg-white/[0.07] p-7 backdrop-blur">
          <p className="text-5xl font-bold leading-none">{c.price}</p>
          <p className="mt-1 mb-6 text-sm text-white/50">{c.period}</p>
          <ul className="mb-7 flex flex-col gap-2.5">
            {c.planItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                <span className="text-xs font-bold text-emerald-300">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Button size="lg" asChild className="w-full rounded-xl bg-(--theme-primary) font-bold text-(--theme-on-primary) hover:opacity-90">
            <Link href={pricingHref}>{c.planCtaText}</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-white/45">{c.guarantee}</p>
        </div>
      </div>
    </section>
  );
}
