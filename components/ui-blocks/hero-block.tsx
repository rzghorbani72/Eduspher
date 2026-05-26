import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { buildAcademyPath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { HeroSlideshow, type SlideConfig } from "./hero-slideshow";

interface HeroBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaSecondary?: string;
    backgroundImage?: string | null;
    overlay?: boolean;
    alignment?: "left" | "center" | "right";
    height?: "small" | "medium" | "large";
    style?: "default" | "expert" | "creator-store" | "social" | "community" | "studio" | "creator" | "expert-academy";
    gradient?: "default" | "purple";
    dark?: boolean;
    showExpertPhotos?: boolean;
    showProductCards?: boolean;
    /** Multiple slides for the hero carousel. When provided, overrides single title/subtitle. */
    slides?: SlideConfig[];
  };
  storeContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
}

const heightCls = { small: "py-8 sm:py-10", medium: "py-12 sm:py-16", large: "py-20 sm:py-28" };

export function HeroBlock({ id, config, storeContext }: HeroBlockProps) {
  const style = config?.style ?? "default";
  if (style === "expert" || style === "expert-academy") return <ExpertAcademyHero id={id} config={config} storeContext={storeContext} />;
  if (style === "creator-store" || style === "creator") return <CreatorHero id={id} config={config} storeContext={storeContext} />;
  if (style === "social") return <SocialHero id={id} config={config} storeContext={storeContext} />;
  if (style === "community") return <CommunityHero id={id} config={config} storeContext={storeContext} />;
  if (style === "studio") return <StudioHero id={id} config={config} storeContext={storeContext} />;
  return <DefaultHero id={id} config={config} storeContext={storeContext} />;
}

// ── Default ───────────────────────────────────────────────────────────────────

function DefaultHero({ id, config, storeContext }: HeroBlockProps) {
  const alignment = (config?.alignment ?? "center") as "left" | "center" | "right";
  const height    = (config?.height ?? "medium")    as "small" | "medium" | "large";

  // If slides array provided, delegate entirely to the carousel
  if (config?.slides && config.slides.length > 1) {
    return (
      <section id={id || "hero"}>
        <HeroSlideshow
          slides={config.slides}
          alignment={alignment}
          height={height}
          storeContext={storeContext}
          dark
        />
      </section>
    );
  }

  // Single-image / gradient default hero
  const title    = config?.title    || "Welcome to Our Store";
  const subtitle = config?.subtitle || "Learn something new today";
  const showCTA  = config?.showCTA  !== false;
  const ctaText  = config?.ctaText  || "Browse Courses";
  const hasBackground = !!config?.backgroundImage;
  const alignMap = { left: "text-left items-start", center: "text-center items-center", right: "text-right items-end" };
  const titleSz  = height === "small" ? "text-3xl sm:text-4xl md:text-5xl" : height === "medium" ? "text-4xl sm:text-5xl md:text-6xl" : "text-5xl sm:text-6xl md:text-7xl";
  const bgStyle  = hasBackground
    ? { backgroundImage: `url(${config!.backgroundImage})` }
    : { background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 18%, var(--theme-background)), color-mix(in srgb, var(--theme-secondary) 8%, var(--theme-background)), color-mix(in srgb, var(--theme-accent) 6%, var(--theme-background)))" };

  return (
    <section id={id || "hero"} className={cn("relative overflow-hidden", heightCls[height], hasBackground ? "bg-cover bg-center" : "")} style={bgStyle}>
      {!hasBackground && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-linear-to-br from-(--theme-primary)/20 to-(--theme-secondary)/20 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linear-to-br from-(--theme-secondary)/20 to-(--theme-accent)/20 blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 mt-14">
        <div className={cn("mx-auto max-w-4xl flex flex-col", alignMap[alignment])}>
          <h1 data-scroll-animate="fadeIn" className={cn("font-bold tracking-tight", titleSz)}>
            <span className="bg-clip-text text-transparent bg-linear-to-r from-(--theme-primary) via-(--theme-secondary) to-(--theme-accent)">{title}</span>
          </h1>
          {subtitle && <p data-scroll-animate="fadeIn" data-scroll-delay="0.15" className="mt-3 leading-relaxed text-lg sm:text-xl opacity-70">{subtitle}</p>}
          {showCTA && (
            <div data-scroll-animate="slideLeft" data-scroll-delay="0.3" className={cn("mt-6 flex flex-wrap gap-4", alignment === "center" ? "justify-center" : "justify-start")}>
              <Button size="lg" asChild className="bg-linear-to-r from-(--theme-primary) to-(--theme-secondary) hover:opacity-90 text-white shadow-lg">
                <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")} className="text-white">{ctaText}</Link>
              </Button>
              {config?.ctaSecondary && (
                <Button size="lg" variant="outline" asChild>
                  <Link href={buildAcademyPath(storeContext?.slug ?? null, "/about")} className="text-white">{config.ctaSecondary}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Expert Academy (Kajabi-inspired) ─────────────────────────────────────────

function ExpertAcademyHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "Turn What You Know Into What You're Known For";
  const subtitle = config?.subtitle || "The all-in-one platform to build, sell, and scale your expert business.";
  const ctaText = config?.ctaText || "Start Free Today";
  const ctaSecondary = config?.ctaSecondary || "See How It Works";

  return (
    <section id={id || "hero"} className="relative overflow-hidden bg-[#fdf6f0] py-20 sm:py-28">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-100/50 blur-2xl" />
        <div className="absolute top-20 left-1/2 h-1 w-32 bg-linear-to-r from-transparent via-rose-300 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div data-scroll-animate="fadeIn" className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            Trusted by 100K+ Creators
          </div>
          <h1 data-scroll-animate="fadeIn" data-scroll-delay="0.1" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            {title}
          </h1>
          <p data-scroll-animate="fadeIn" data-scroll-delay="0.2" className="mt-5 text-lg leading-relaxed text-gray-600 sm:text-xl max-w-2xl mx-auto">{subtitle}</p>

          <div data-scroll-animate="fadeIn" data-scroll-delay="0.3" className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-[#e8523a] hover:bg-[#cf4730] text-white shadow-xl shadow-rose-200 font-semibold px-8">
              <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")} className="text-white">{ctaText}</Link>
            </Button>
            {ctaSecondary && (
              <Button size="lg" variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold">
                <Link href={buildAcademyPath(storeContext?.slug ?? null, "/pricing")} className="text-gray-700">{ctaSecondary}</Link>
              </Button>
            )}
          </div>

          {config?.showExpertPhotos !== false && (
            <div data-scroll-animate="fadeIn" data-scroll-delay="0.45" className="mt-14 flex items-center justify-center gap-3">
              <div className="flex -space-x-3">
                {["👩‍🏫", "👨‍💼", "👩‍🎤", "👨‍🎨", "👩‍⚕️"].map((e, i) => (
                  <div key={i} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-md ring-2 ring-white">{e}</div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex gap-0.5">{"★★★★★".split("").map((s, i) => <span key={i} className="text-amber-400 text-sm">{s}</span>)}</div>
                <p className="text-xs text-gray-500 mt-0.5">Join 100K+ successful creators</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Studio (Warm amber/teal — for educators & studio owners) ──────────────────

function StudioHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "Your Studio, Your Rules";
  const subtitle = config?.subtitle || "Create, teach and sell your courses with a beautiful all-in-one platform.";
  const ctaText = config?.ctaText || "Start Creating";
  const ctaSecondary = config?.ctaSecondary || "Explore Features";

  return (
    <section id={id || "hero"} className="relative overflow-hidden bg-amber-50 py-20 sm:py-28">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text side */}
          <div>
            <div data-scroll-animate="slideLeft" className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Built for creators
            </div>
            <h1 data-scroll-animate="slideLeft" data-scroll-delay="0.1" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
              {title}
            </h1>
            <p data-scroll-animate="slideLeft" data-scroll-delay="0.2" className="mt-5 text-lg leading-relaxed text-gray-600">{subtitle}</p>

            <div data-scroll-animate="slideLeft" data-scroll-delay="0.3" className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200 font-semibold">
                <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")} className="text-white">{ctaText}</Link>
              </Button>
              {ctaSecondary && (
                <Button size="lg" variant="outline" asChild className="border-amber-300 text-amber-800 hover:bg-amber-100">
                  <Link href={buildAcademyPath(storeContext?.slug ?? null, "/about")} className="text-amber-800">{ctaSecondary}</Link>
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div data-scroll-animate="slideLeft" data-scroll-delay="0.4" className="mt-10 grid grid-cols-3 gap-4">
              {[["5K+", "Courses"], ["98%", "Satisfaction"], ["24/7", "Support"]].map(([val, label], i) => (
                <div key={i} className="rounded-xl bg-white p-3 text-center shadow-sm border border-amber-100">
                  <p className="text-xl font-bold text-teal-600">{val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div data-scroll-animate="slideRight" className="relative">
            <div className="relative rounded-2xl bg-white p-4 shadow-2xl shadow-amber-100 border border-amber-100">
              {/* Mock course card */}
              <div className="rounded-xl bg-linear-to-br from-teal-500 to-teal-600 p-5 text-white mb-3">
                <p className="text-xs font-medium opacity-80">Featured Course</p>
                <p className="mt-1 text-lg font-bold leading-tight">Master Your Craft in 30 Days</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">👩‍🏫</div>
                  <span className="text-xs opacity-80">12 lessons · 4h total</span>
                </div>
              </div>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2">
                {["🎓 Learn", "🏆 Certify", "🚀 Grow"].map((item, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 p-2 text-center text-xs font-medium text-amber-800">{item}</div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -right-4 -top-4 rounded-xl bg-teal-600 px-3 py-2 text-white shadow-lg">
              <p className="text-xs font-bold">🔥 Popular</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Creator (Bold creator economy) ────────────────────────────────────────────

function CreatorHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "The All-in-One Platform for Modern Creators";
  const subtitle = config?.subtitle || "Sell courses, digital products, and memberships — all from one beautiful storefront.";
  const ctaText = config?.ctaText || "Start Your Free Trial";
  const ctaSecondary = config?.ctaSecondary || "Watch Demo";

  const products = [
    { icon: "📚", label: "Courses", color: "bg-orange-100 text-orange-700" },
    { icon: "🎁", label: "Digital Products", color: "bg-violet-100 text-violet-700" },
    { icon: "👥", label: "Memberships", color: "bg-pink-100 text-pink-700" },
    { icon: "🎙️", label: "Coaching", color: "bg-teal-100 text-teal-700" },
  ];

  return (
    <section id={id || "hero"} className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full bg-linear-to-br from-violet-100 to-pink-50 blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <div>
            <div data-scroll-animate="slideLeft" className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-violet-200">
              ✨ Made for creators like you
            </div>
            <h1 data-scroll-animate="slideLeft" data-scroll-delay="0.1" className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              {title}
            </h1>
            <p data-scroll-animate="slideLeft" data-scroll-delay="0.2" className="mt-5 text-lg leading-relaxed text-gray-600">{subtitle}</p>

            <div data-scroll-animate="slideLeft" data-scroll-delay="0.3" className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-200 font-bold px-8 rounded-full">
                <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")} className="text-white">{ctaText}</Link>
              </Button>
              {ctaSecondary && (
                <Button size="lg" variant="ghost" asChild className="text-violet-600 hover:bg-violet-50 font-semibold gap-2">
                  <Link href={buildAcademyPath(storeContext?.slug ?? null, "/about")} className="text-violet-600">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">▶</span>
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Product pills grid */}
          <div data-scroll-animate="slideRight" className="grid grid-cols-2 gap-4">
            {products.map((p, i) => (
              <div key={i} className={cn("flex items-center gap-3 rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow", i % 2 === 1 ? "mt-6" : "")}>
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                  <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium", p.color)}>
                    Ready to sell
                  </span>
                </div>
              </div>
            ))}
            {/* Revenue widget */}
            <div className="col-span-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 p-5 text-white shadow-xl">
              <p className="text-sm font-medium opacity-80">This month's earnings</p>
              <p className="text-3xl font-bold mt-1">$12,840</p>
              <p className="text-xs opacity-70 mt-1">↑ 24% from last month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Social / Stan-inspired ─────────────────────────────────────────────────────

function SocialHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "Meet Your All-in-One Creator Store";
  const subtitle = config?.subtitle || "Join 100,000+ solo business owners building their dream business.";
  const ctaText = config?.ctaText || "Start Your Trial";

  return (
    <section id={id || "hero"} className="relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 py-24 sm:py-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-purple-300/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h1 data-scroll-animate="fadeIn" className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
        <p data-scroll-animate="fadeIn" data-scroll-delay="0.15" className="mt-5 text-lg leading-relaxed text-purple-100 sm:text-xl">{subtitle}</p>
        <div data-scroll-animate="fadeIn" data-scroll-delay="0.3" className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild className="bg-orange-400 hover:bg-orange-500 text-white font-semibold shadow-xl rounded-full px-8">
            <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")} className="text-white">{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Community (Circle-inspired, dark) ─────────────────────────────────────────

function CommunityHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "Where Your Community Comes to Life";
  const subtitle = config?.subtitle || "Create spaces for your audience to connect, learn, and grow together.";
  const ctaText = config?.ctaText || "Build Your Community";
  const ctaSecondary = config?.ctaSecondary || "See Examples";

  return (
    <section id={id || "hero"} className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-indigo-900/40 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-violet-900/30 blur-3xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div data-scroll-animate="fadeIn" className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-700/50 bg-indigo-950/50 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            Now in public beta
          </div>

          <h1 data-scroll-animate="fadeIn" data-scroll-delay="0.1" className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
            {title}
          </h1>
          <p data-scroll-animate="fadeIn" data-scroll-delay="0.2" className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl">{subtitle}</p>

          <div data-scroll-animate="fadeIn" data-scroll-delay="0.3" className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-xl shadow-indigo-900/50 px-8 rounded-xl">
              <Link href={buildAcademyPath(storeContext?.slug ?? null, "/courses")} className="text-white">{ctaText}</Link>
            </Button>
            {ctaSecondary && (
              <Button size="lg" variant="outline" asChild className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 rounded-xl">
                <Link href={buildAcademyPath(storeContext?.slug ?? null, "/about")} className="text-slate-300">{ctaSecondary}</Link>
              </Button>
            )}
          </div>

          {/* Member avatars */}
          <div data-scroll-animate="fadeIn" data-scroll-delay="0.45" className="mt-12 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {["🧑‍💼", "👩‍🎓", "👨‍🔬", "👩‍🎨", "🧑‍🏫"].map((e, i) => (
                <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg ring-2 ring-slate-900">{e}</div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {"★★★★★".split("").map((s, i) => <span key={i} className="text-amber-400 text-xs">{s}</span>)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">10,000+ active members</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
