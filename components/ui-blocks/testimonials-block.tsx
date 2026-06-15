import { cn } from "@/lib/utils";
import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { SlotGrid, PlaceholderCard } from "./slot-grid";
import { resolveSlots, type SlotConfig } from "@/lib/slot-config";

interface TestimonialsBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    layout?: "grid" | "carousel";
    showAvatars?: boolean;
    corporate?: boolean;
    style?: "default" | "dark-quote" | "social-proof" | "creator-stories" | "studio" | "creator" | "flow" | "code" | "creative";
    label?: string;
    /** flow: testimonial cards. */
    items?: { quote?: string; name?: string; role?: string; initials?: string }[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

// Module-level English defaults used by sub-style components (kajabi, podia, stan, circle templates)
const testimonials = [
  { name: "Sarah Johnson", role: "Software Engineer", company: "Tech Corp", content: "This platform transformed my career. The courses are comprehensive and the instructors are world-class.", avatar: "👩‍💻", revenue: "$12K/mo", rating: 5 },
  { name: "Michael Chen", role: "Product Manager", company: "StartupXYZ", content: "The best investment I've made in my professional development. Highly recommend to anyone serious about learning.", avatar: "👨‍💼", revenue: "$8K/mo", rating: 5 },
  { name: "Emily Rodriguez", role: "Data Scientist", company: "Data Insights", content: "The hands-on projects make all the difference. I landed my dream job thanks to this platform.", avatar: "👩‍🔬", revenue: "$15K/mo", rating: 5 },
  { name: "David Kim", role: "UX Designer", company: "Design Studio", content: "The community support and mentorship opportunities are incredible. You're never learning alone here.", avatar: "👨‍🎨", revenue: "$9K/mo", rating: 5 },
  { name: "Lisa Anderson", role: "Marketing Director", company: "Brand Agency", content: "Flexible learning schedule fits perfectly with my busy work life. Quality content that's worth every minute.", avatar: "👩‍💼", revenue: "$20K/mo", rating: 5 },
  { name: "James Wilson", role: "CTO", company: "Enterprise Solutions", content: "Our entire team uses this platform for continuous learning. The ROI has been exceptional.", avatar: "👨‍💻", revenue: "$50K/mo", rating: 5 },
];

const Stars = ({ count, color = "text-(--theme-accent)" }: { count: number; color?: string }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className={cn("h-4 w-4 fill-current", color)} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export async function TestimonialsBlock({ id, config }: TestimonialsBlockProps) {
  const blockStyle = config?.style ?? "default";

  if (blockStyle === "flow" || blockStyle === "code") return <FlowTestimonials id={id} config={config} />;
  if (blockStyle === "creative") return <CreativeTestimonials id={id} config={config} />;
  if (blockStyle === "dark-quote")      return <DarkQuoteTestimonials id={id} config={config} />;
  if (blockStyle === "social-proof")    return <SocialProofTestimonials id={id} config={config} />;
  if (blockStyle === "creator-stories") return <CreatorStoriesTestimonials id={id} config={config} />;
  if (blockStyle === "studio")          return <StudioTestimonials id={id} config={config} />;
  if (blockStyle === "creator")         return <CreatorTestimonials id={id} config={config} />;

  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(currentAcademy?.language || null, currentAcademy?.country_code || null);
  const tr = (key: string) => t(key, language);

  const localizedTestimonials = [
    { name: tr("blocks.testimonial1Name"), role: tr("blocks.testimonial1Role"), company: tr("blocks.testimonial1Company"), content: tr("blocks.testimonial1Content"), avatar: "👩‍💻", revenue: "$12K/mo", rating: 5 },
    { name: tr("blocks.testimonial2Name"), role: tr("blocks.testimonial2Role"), company: tr("blocks.testimonial2Company"), content: tr("blocks.testimonial2Content"), avatar: "👨‍💼", revenue: "$8K/mo", rating: 5 },
    { name: tr("blocks.testimonial3Name"), role: tr("blocks.testimonial3Role"), company: tr("blocks.testimonial3Company"), content: tr("blocks.testimonial3Content"), avatar: "👩‍🔬", revenue: "$15K/mo", rating: 5 },
    { name: tr("blocks.testimonial4Name"), role: tr("blocks.testimonial4Role"), company: tr("blocks.testimonial4Company"), content: tr("blocks.testimonial4Content"), avatar: "👨‍🎨", revenue: "$9K/mo", rating: 5 },
    { name: tr("blocks.testimonial5Name"), role: tr("blocks.testimonial5Role"), company: tr("blocks.testimonial5Company"), content: tr("blocks.testimonial5Content"), avatar: "👩‍💼", revenue: "$20K/mo", rating: 5 },
    { name: tr("blocks.testimonial6Name"), role: tr("blocks.testimonial6Role"), company: tr("blocks.testimonial6Company"), content: tr("blocks.testimonial6Content"), avatar: "👨‍💻", revenue: "$50K/mo", rating: 5 },
  ];

  const title = config?.title || "What Students Say";
  const subtitle = config?.subtitle || "Hear from our community";
  const layout = config?.layout || "grid";
  const showAvatars = config?.showAvatars !== false;
  const corporate = config?.corporate === true;
  const items = corporate
    ? localizedTestimonials.slice(0, 3).map(item => ({ ...item, role: "VP of Learning", company: "Fortune 500" }))
    : localizedTestimonials;

  const Avatar = ({ emoji }: { emoji: string }) =>
    showAvatars ? (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl bg-(--theme-secondary-subtle)">
        {emoji}
      </div>
    ) : null;

  if (layout === "carousel") {
    return (
      <section id={id || "testimonials"} className="py-16 sm:py-20 overflow-hidden bg-(--theme-surface-alt) text-(--theme-foreground)">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 text-(--theme-foreground)">
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{ letterSpacing: '-0.025em' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p data-scroll-animate="fadeIn" data-scroll-delay="0.15" className="mt-3 text-base leading-relaxed text-(--theme-foreground)/60">
                {subtitle}
              </p>
            )}
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll w-max">
              {[...items, ...items].map((t, i) => (
                <div key={i} className="min-w-80 shrink-0 rounded-2xl border p-6 shadow-sm bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)">
                  <Stars count={t.rating} />
                  <p className="text-sm leading-relaxed mb-4 text-(--theme-foreground)/70">&quot;{t.content}&quot;</p>
                  <div className="flex items-center gap-3">
                    <Avatar emoji={t.avatar} />
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-(--theme-foreground)/55">{t.role} at {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // grid layout
  return (
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-(--theme-surface-alt) text-(--theme-foreground)">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 text-(--theme-foreground)">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{ letterSpacing: '-0.025em' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p data-scroll-animate="fadeIn" data-scroll-delay="0.15" className="mt-3 text-base leading-relaxed text-(--theme-foreground)/60">
              {subtitle}
            </p>
          )}
        </div>
        <SlotGrid config={config} minBasisFallback="320px">
          {resolveSlots(items, config?.slots, 3).map((slot, i) =>
            slot.kind === "live" ? (
              <div
                key={i}
                data-scroll-animate="fadeInUp"
                data-scroll-delay={`${0.1 * i}`}
                className={cn("group flex h-full flex-col rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)")}
              >
                <Stars count={slot.data.rating} />
                <p className="text-sm leading-relaxed flex-1 mb-4 text-(--theme-foreground)/70">&quot;{slot.data.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="transition-transform group-hover:scale-110"><Avatar emoji={slot.data.avatar} /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{slot.data.name}</p>
                    <p className="text-xs text-(--theme-foreground)/55">{slot.data.role}</p>
                  </div>
                </div>
              </div>
            ) : (
              <PlaceholderCard key={i} text={slot.text} />
            ),
          )}
        </SlotGrid>
      </div>
    </section>
  );
}

// ── Dark Quote (Expert Academy / Kajabi + Community / Circle) ─────────────────

function DarkQuoteTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "Why experts choose us";
  const items = testimonials.slice(0, 3);

  return (
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-(--theme-background) text-(--theme-foreground)">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-center text-2xl font-bold text-(--theme-foreground) mb-12 sm:text-3xl"
          >
            {title}
          </h2>
        )}

        {/* Featured large quote */}
        <div
          data-scroll-animate="scaleUp"
          data-scroll-delay="0.1"
          className="mx-auto max-w-3xl rounded-2xl bg-(--theme-card-bg) border border-(--theme-border-color) p-10 text-center shadow-2xl mb-8"
        >
          <p className="text-4xl font-bold text-(--theme-foreground) mb-1">{testimonials[4].revenue}</p>
          <p className="text-(--theme-foreground)/55 text-sm mb-6 uppercase tracking-wide">earned on this platform</p>
          <blockquote className="text-lg leading-relaxed text-(--theme-foreground)/75 italic mb-6">
            &quot;{testimonials[4].content}&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--theme-secondary-subtle) text-2xl">
              {testimonials[4].avatar}
            </div>
            <div className="text-left">
              <p className="font-semibold text-(--theme-foreground)">{testimonials[4].name}</p>
              <p className="text-sm text-(--theme-foreground)/55">{testimonials[4].role}, {testimonials[4].company}</p>
            </div>
          </div>
        </div>

        {/* Secondary quotes row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.15 + 0.08 * i}`}
              className="rounded-xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-5"
            >
              <Stars count={t.rating} />
              <p className="text-sm text-(--theme-foreground)/75 leading-relaxed mb-4">&quot;{t.content}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--theme-secondary-subtle) text-lg">{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-(--theme-foreground)">{t.name}</p>
                  <p className="text-xs text-(--theme-foreground)/55">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Social Proof screenshots (Creator / Stan.store-inspired) ──────────────────

function SocialProofTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "See What People Are Saying";

  const proofItems = testimonials.slice(0, 4).map((t) => ({
    name: t.name,
    revenue: t.revenue,
    content: t.content.slice(0, 80) + "…",
    avatar: t.avatar,
    rating: t.rating,
  }));

  return (
    <section id={id || "testimonials"} className="py-14 sm:py-20 bg-(--theme-background)">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-center text-2xl font-bold text-(--theme-foreground) mb-3 sm:text-3xl"
          >
            {title} <span className="text-(--theme-primary)">👉</span>
          </h2>
        )}
        <p data-scroll-animate="fadeIn" data-scroll-delay="0.12" className="text-center text-sm text-(--theme-foreground)/55 mb-10">
          Real screenshots. Real results.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofItems.map((p, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.08 * i}`}
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-lg">{p.avatar}</div>
                <div>
                  <p className="text-xs font-semibold text-(--theme-foreground)">{p.name}</p>
                  <p className="text-xs font-bold text-(--theme-primary)">{p.revenue}</p>
                </div>
              </div>
              <Stars count={p.rating} />
              <p className="text-xs text-(--theme-foreground)/70 leading-relaxed">&quot;{p.content}&quot;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Creator Stories (Studio / Podia-inspired) ─────────────────────────────────

function CreatorStoriesTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "Their businesses finally found a home";
  const subtitle = config?.subtitle || "Creators, coaches, and consultants grow their business here.";
  const creators = testimonials.slice(0, 2);

  return (
    <section id={id || "testimonials"} className="py-14 sm:py-20 bg-(--theme-background)">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p data-scroll-animate="fadeIn" data-scroll-delay="0.15" className="mt-2 text-base text-(--theme-foreground)/60">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-10">
          {creators.map((c, i) => (
            <div
              key={i}
              data-scroll-animate={i === 0 ? "slideLeft" : "slideRight"}
              data-scroll-delay="0.1"
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-3xl">
                  {c.avatar}
                </div>
                <div>
                  <p className="font-bold text-(--theme-foreground)">{c.name}</p>
                  <p className="text-sm text-(--theme-foreground)/60">{c.role}</p>
                  <p className="text-sm font-semibold text-(--theme-primary)">{c.revenue}/month</p>
                </div>
              </div>
              <Stars count={c.rating} />
              <p className="text-(--theme-foreground)/70 leading-relaxed">&quot;{c.content}&quot;</p>
            </div>
          ))}
        </div>

        {/* Mini proof strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {testimonials.slice(2, 6).map((t, i) => (
            <div
              key={i}
              data-scroll-animate="scaleUp"
              data-scroll-delay={`${0.05 * i}`}
              className="rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) p-3 text-center shadow-sm"
            >
              <p className="text-lg font-bold text-(--theme-primary)">{t.revenue}</p>
              <p className="text-xs text-(--theme-foreground)/60">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Studio testimonials (warm amber/teal grid) ────────────────────────────────

function StudioTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "Loved by creators everywhere";
  const items = testimonials.slice(0, 3);

  return (
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-(--theme-surface-alt)">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-12">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
          >
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.1 * i}`}
              className="rounded-2xl bg-(--theme-card-bg) border border-(--theme-border-color) p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <Stars count={t.rating} />
              <p className="text-sm text-(--theme-foreground)/75 leading-relaxed mb-5">&quot;{t.content}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-xl">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm text-(--theme-foreground)">{t.name}</p>
                  <p className="text-xs text-(--theme-primary) font-medium">{t.revenue}/mo</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Creator testimonials (violet social-media style) ─────────────────────────

function CreatorTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "Join thousands of creators";
  const items = testimonials.slice(0, 4);

  return (
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-(--theme-background) overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-12">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
          >
            {title}
          </h2>
        </div>
        {/* Masonry-style 2-col stagger */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((t, i) => (
            <div
              key={i}
              data-scroll-animate={i % 2 === 0 ? "slideLeft" : "slideRight"}
              data-scroll-delay={`${0.08 * i}`}
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-xl">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm text-(--theme-foreground)">{t.name}</p>
                  <p className="text-xs font-bold text-(--theme-primary)">{t.revenue}/mo</p>
                </div>
              </div>
              <Stars count={t.rating} />
              <p className="text-sm text-(--theme-foreground)/70 leading-relaxed">&quot;{t.content}&quot;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Creative (استودیوی خلاق) — three avatar cards with amber stars ───────────

const CREATIVE_TESTI_TONES = [
  "bg-(--theme-primary) text-(--theme-on-primary)",
  "bg-(--theme-accent) text-(--theme-on-accent)",
  "bg-(--theme-secondary) text-(--theme-on-secondary)",
];

const CREATIVE_TESTI_ITEMS = [
  { quote: "«منتوریار بهترین تصمیم یادگیری‌ام بود. مهارت‌های واقعی بدون بار مالی تحصیلات سنتی.»", name: "رئوف رضایی", role: "تصویرساز", initials: "ر" },
  { quote: "«دوست دارم جایی باشد که بتوانم با سایر خلاقان ارتباط برقرار کنم و در سفر یادگیری از هم حمایت کنیم.»", name: "الهام ولیزاده", role: "طراح گرافیک", initials: "ا" },
  { quote: "«به ندرت برای چیزی اشتراک می‌گیرم، اما این یکی از اشتراک‌هایی است که نمی‌توانم بدونش تصور کنم.»", name: "کامیار محمدی", role: "طراح UX", initials: "ک" },
];

function CreativeTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "چرا دانشجویان منتوریار را دوست دارند";
  const items = config?.items?.length ? config.items : CREATIVE_TESTI_ITEMS;

  return (
    <section id={id || "testimonials"} className="bg-(--theme-background) py-[80px]">
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[40px] text-center text-[22px] font-black text-(--theme-foreground)">{title}</div>
        <div className="grid gap-[20px] md:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-[20px] border-2 border-(--theme-border-color) bg-(--theme-surface) p-[28px]">
              <div className="mb-[14px] text-[16px] tracking-[2px] text-(--theme-accent)">★★★★★</div>
              <div className="mb-[20px] text-[14px] font-semibold leading-[1.8] text-(--theme-foreground)">{item.quote}</div>
              <div className="flex flex-row-reverse items-center justify-end gap-[12px] border-t-2 border-(--theme-border-color) pt-[16px]">
                <div className={cn("flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full text-[15px] font-black", CREATIVE_TESTI_TONES[i % CREATIVE_TESTI_TONES.length])}>
                  {item.initials}
                </div>
                <div>
                  <div className="text-[14px] font-extrabold text-(--theme-foreground)">{item.name}</div>
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

// ── Flow (منتوریار) — three-card grid ────────────────────────────────────────

const FLOW_AVATAR_TONES = [
  "bg-(--theme-primary) text-(--theme-on-primary)",
  "bg-(--theme-secondary) text-(--theme-on-secondary)",
  "bg-(--theme-accent) text-(--theme-on-accent)",
];

const FLOW_ITEMS = [
  {
    quote:
      "«دوره‌های منتوریار به من کمک کرد اولین نقش UX خودم را در ۴ ماه پیدا کنم. پروژه‌های عملی همه چیز را متفاوت کردند.»",
    name: "جواد ویلسون",
    role: "طراح UX در استرایپ",
    initials: "جو",
  },
  {
    quote:
      "«۳ دوره را در یک ماه تمام کردم. مسیرهای ساختارمند تمرکزم را حفظ کردند و مربیان فوق‌العاده پاسخگو بودند.»",
    name: "الهام مارتینز",
    role: "طراح محصول",
    initials: "اِ",
  },
  {
    quote:
      "«گواهینامه‌ای که از منتوریار گرفتم، رزومه‌ام را از فیلتر کارگزین رد کرد. واقعاً ارزشش را دارد.»",
    name: "داوود لی",
    role: "سرپرست طراحی در فیگما",
    initials: "دا",
  },
];

function FlowTestimonials({ id, config }: TestimonialsBlockProps) {
  const label = config?.label || "نظر یادگیرندگان";
  const title = config?.title || "مورد اعتماد هزاران طراح";
  const items = config?.items?.length ? config.items : FLOW_ITEMS;

  return (
    <section id={id || "testimonials"} className="mx-auto max-w-[1240px] px-[48px] py-[60px]">
      <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
      <div className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.3] text-(--theme-foreground)">
        {title}
      </div>
      <div className="mt-[36px] grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[28px]"
          >
            <div className="mb-[16px] flex gap-0.5">
              {"★★★★★".split("").map((s, si) => (
                <span key={si} className="text-[14px] text-(--theme-accent)">{s}</span>
              ))}
            </div>
            <div className="mb-[20px] text-[14px] font-medium leading-[1.85] text-(--theme-foreground)">
              {item.quote}
            </div>
            <div className="flex items-center gap-[12px]">
              <div
                className={cn(
                  "flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold",
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
