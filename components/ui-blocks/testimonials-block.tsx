import { cn } from "@/lib/utils";

interface TestimonialsBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    layout?: "grid" | "carousel";
    showAvatars?: boolean;
    corporate?: boolean;
    style?: "default" | "dark-quote" | "social-proof" | "creator-stories" | "studio" | "creator";
  };
}

const testimonials = [
  { name: "Sarah Johnson", role: "Software Engineer", company: "Tech Corp", content: "This platform transformed my career. The courses are comprehensive and the instructors are world-class.", avatar: "👩‍💻", revenue: "$12K/mo", rating: 5 },
  { name: "Michael Chen", role: "Product Manager", company: "StartupXYZ", content: "The best investment I've made in my professional development. Highly recommend to anyone serious about learning.", avatar: "👨‍💼", revenue: "$8K/mo", rating: 5 },
  { name: "Emily Rodriguez", role: "Data Scientist", company: "Data Insights", content: "The hands-on projects make all the difference. I landed my dream job thanks to this platform.", avatar: "👩‍🔬", revenue: "$15K/mo", rating: 5 },
  { name: "David Kim", role: "UX Designer", company: "Design Studio", content: "The community support and mentorship opportunities are incredible. You're never learning alone here.", avatar: "👨‍🎨", revenue: "$9K/mo", rating: 5 },
  { name: "Lisa Anderson", role: "Marketing Director", company: "Brand Agency", content: "Flexible learning schedule fits perfectly with my busy work life. Quality content that's worth every minute.", avatar: "👩‍💼", revenue: "$20K/mo", rating: 5 },
  { name: "James Wilson", role: "CTO", company: "Enterprise Solutions", content: "Our entire team uses this platform for continuous learning. The ROI has been exceptional.", avatar: "👨‍💻", revenue: "$50K/mo", rating: 5 },
];

const Stars = ({ count, color = "text-amber-400" }: { count: number; color?: string }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className={cn("h-4 w-4 fill-current", color)} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export function TestimonialsBlock({ id, config }: TestimonialsBlockProps) {
  const blockStyle = config?.style ?? "default";

  if (blockStyle === "dark-quote")      return <DarkQuoteTestimonials id={id} config={config} />;
  if (blockStyle === "social-proof")    return <SocialProofTestimonials id={id} config={config} />;
  if (blockStyle === "creator-stories") return <CreatorStoriesTestimonials id={id} config={config} />;
  if (blockStyle === "studio")          return <StudioTestimonials id={id} config={config} />;
  if (blockStyle === "creator")         return <CreatorTestimonials id={id} config={config} />;

  const title = config?.title || "What Students Say";
  const subtitle = config?.subtitle || "Hear from our community";
  const layout = config?.layout || "grid";
  const showAvatars = config?.showAvatars !== false;
  const corporate = config?.corporate === true;
  const items = corporate
    ? testimonials.slice(0, 3).map(t => ({ ...t, role: "VP of Learning", company: "Fortune 500" }))
    : testimonials;

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
                <div key={i} className="min-w-[340px] shrink-0 rounded-2xl border p-6 shadow-sm bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)">
                  <Stars count={t.rating} />
                  <p className="text-sm leading-relaxed mb-4 text-(--theme-foreground)/70">"{t.content}"</p>
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
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {items.slice(0, 3).map((t, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.1 * i}`}
              className={cn("group flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)")}
            >
              <Stars count={t.rating} />
              <p className="text-sm leading-relaxed flex-1 mb-4 text-(--theme-foreground)/70">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="transition-transform group-hover:scale-110"><Avatar emoji={t.avatar} /></div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t.name}</p>
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

// ── Dark Quote (Expert Academy / Kajabi + Community / Circle) ─────────────────

function DarkQuoteTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "Why experts choose us";
  const items = testimonials.slice(0, 3);

  return (
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-center text-2xl font-bold text-white mb-12 sm:text-3xl"
          >
            {title}
          </h2>
        )}

        {/* Featured large quote */}
        <div
          data-scroll-animate="scaleUp"
          data-scroll-delay="0.1"
          className="mx-auto max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-10 text-center shadow-2xl mb-8"
        >
          <p className="text-4xl font-bold text-white mb-1">{testimonials[4].revenue}</p>
          <p className="text-slate-400 text-sm mb-6 uppercase tracking-wide">earned on this platform</p>
          <blockquote className="text-lg leading-relaxed text-slate-300 italic mb-6">
            "{testimonials[4].content}"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-2xl">
              {testimonials[4].avatar}
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">{testimonials[4].name}</p>
              <p className="text-sm text-slate-400">{testimonials[4].role}, {testimonials[4].company}</p>
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
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <Stars count={t.rating} color="text-amber-400" />
              <p className="text-sm text-slate-300 leading-relaxed mb-4">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-lg">{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
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
    <section id={id || "testimonials"} className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-center text-2xl font-bold text-gray-900 mb-3 sm:text-3xl"
          >
            {title} <span className="text-violet-500">👉</span>
          </h2>
        )}
        <p data-scroll-animate="fadeIn" data-scroll-delay="0.12" className="text-center text-sm text-gray-400 mb-10">
          Real screenshots. Real results.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofItems.map((p, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.08 * i}`}
              className="rounded-2xl border border-gray-100 bg-white shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-lg">{p.avatar}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs font-bold text-violet-600">{p.revenue}</p>
                </div>
              </div>
              <Stars count={p.rating} color="text-yellow-400" />
              <p className="text-xs text-gray-600 leading-relaxed">"{p.content}"</p>
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
    <section id={id || "testimonials"} className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p data-scroll-animate="fadeIn" data-scroll-delay="0.15" className="mt-2 text-base text-gray-500">
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
              className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl">
                  {c.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.role}</p>
                  <p className="text-sm font-semibold text-teal-600">{c.revenue}/month</p>
                </div>
              </div>
              <Stars count={c.rating} color="text-amber-400" />
              <p className="text-gray-600 leading-relaxed">"{c.content}"</p>
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
              className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm"
            >
              <p className="text-lg font-bold text-teal-600">{t.revenue}</p>
              <p className="text-xs text-gray-500">{t.name}</p>
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
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-amber-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-12">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
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
              className="rounded-2xl bg-white border border-amber-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <Stars count={t.rating} color="text-amber-400" />
              <p className="text-sm text-gray-700 leading-relaxed mb-5">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-xl">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-teal-600 font-medium">{t.revenue}/mo</p>
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
    <section id={id || "testimonials"} className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-12">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
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
              className="rounded-2xl border border-violet-100 bg-violet-50 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-200 text-xl">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs font-bold text-violet-600">{t.revenue}/mo</p>
                </div>
              </div>
              <Stars count={t.rating} color="text-violet-400" />
              <p className="text-sm text-gray-600 leading-relaxed">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
