import { cn } from "@/lib/utils";

interface Stat { value: string; label: string; }

interface FeaturesBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    gridColumns?: number;
    showIcons?: boolean;
    variant?: "cards" | "list" | "icons";
    style?: "default" | "stats" | "dark" | "benefits" | "studio" | "creator";
    dark?: boolean;
    showStats?: boolean;
    stats?: Stat[];
    zeroCostBadge?: boolean;
  };
}

const DEFAULT_FEATURES = [
  { title: "Expert Instructors", description: "Learn from industry professionals with years of real-world experience", icon: "🎓" },
  { title: "Flexible Learning", description: "Study at your own pace with lifetime access to course materials", icon: "📚" },
  { title: "Certificates", description: "Earn recognized certificates to boost your career prospects", icon: "🏆" },
  { title: "Interactive Content", description: "Engage with hands-on projects and real-world applications", icon: "💡" },
  { title: "Career Support", description: "Get job placement assistance and career guidance", icon: "🚀" },
  { title: "Community Access", description: "Join a vibrant community of learners and mentors", icon: "⭐" },
];

const DEFAULT_STATS: Stat[] = [
  { value: "100K+", label: "Active students" },
  { value: "$10B+", label: "Earned by creators" },
  { value: "75M+", label: "Customers served" },
];

const gridColCls: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function FeaturesBlock({ id, config }: FeaturesBlockProps) {
  const blockStyle = config?.style ?? "default";

  if (blockStyle === "stats")    return <StatsFeatures id={id} config={config} />;
  if (blockStyle === "dark")     return <DarkFeatures id={id} config={config} />;
  if (blockStyle === "benefits") return <BenefitsFeatures id={id} config={config} />;
  if (blockStyle === "studio")   return <StudioFeatures id={id} config={config} />;
  if (blockStyle === "creator")  return <CreatorFeatures id={id} config={config} />;

  const title = config?.title || "Why Choose Us";
  const subtitle = config?.subtitle || "Discover what makes us special";
  const gridColumns = config?.gridColumns || 3;
  const variant = config?.variant || "cards";
  const showIcons = config?.showIcons !== false;
  const cols = gridColCls[gridColumns] ?? gridColCls[3];
  const items = DEFAULT_FEATURES.slice(0, gridColumns * 2);

  const SectionTitle = ({ centered = false }: { centered?: boolean }) => (
    <div className={cn("max-w-2xl mb-12", centered && "mx-auto text-center")}>
      {title ? (
        <>
          <p
            data-scroll-animate="fadeIn"
            data-scroll-delay="0"
            className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-(--theme-primary)"
          >
            {title}
          </p>
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.08"
            className="text-3xl font-black tracking-tight sm:text-4xl text-(--theme-foreground)"
            style={{ letterSpacing: '-0.025em' }}
          >
            {subtitle || title}
          </h2>
        </>
      ) : subtitle ? (
        <h2
          data-scroll-animate="fadeIn"
          data-scroll-delay="0.05"
          className="text-3xl font-black tracking-tight sm:text-4xl text-(--theme-foreground)"
          style={{ letterSpacing: '-0.025em' }}
        >
          {subtitle}
        </h2>
      ) : null}
    </div>
  );

  const IconBubble = ({ icon }: { icon: string }) => (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110 bg-(--theme-primary-subtle)">
      {icon}
    </div>
  );

  if (variant === "icons") {
    return (
      <section id={id || "features"} className="py-16 sm:py-20 bg-(--theme-background) text-(--theme-foreground)">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle centered />
          <div className={cn("mx-auto grid gap-6 lg:max-w-none", cols)}>
            {items.map((f, i) => (
              <div
                key={i}
                data-scroll-animate="fadeInUp"
                data-scroll-delay={`${0.05 * i}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl transition-all group-hover:scale-110 bg-(--theme-primary-subtle)">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-(--theme-foreground)/60">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section id={id || "features"} className="py-16 sm:py-20 bg-(--theme-surface-alt) text-(--theme-foreground)">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle />
          <div className={cn("mx-auto grid gap-4 lg:max-w-none", cols)}>
            {items.map((f, i) => (
              <div
                key={i}
                data-scroll-animate="slideLeft"
                data-scroll-delay={`${0.08 * i}`}
                className="group flex items-start gap-4 rounded-xl border p-6 transition-all hover:shadow-md bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)"
              >
                {showIcons && <IconBubble icon={f.icon} />}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-(--theme-foreground)/60">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // cards variant (default)
  return (
    <section id={id || "features"} className="py-16 sm:py-20 bg-(--theme-surface-alt) text-(--theme-foreground)">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle centered />
        <div className={cn("mx-auto grid gap-6 lg:max-w-none", cols)}>
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.08 * i}`}
              className="group relative flex flex-col gap-y-3 rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)"
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-(--theme-primary)/5 via-transparent to-(--theme-accent)/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                {showIcons && <div className="mb-3"><IconBubble icon={f.icon} /></div>}
                <h3 className="text-lg font-semibold leading-7">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-(--theme-foreground)/60">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats strip (Expert Academy / Kajabi-inspired) ────────────────────────────

function StatsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title;
  const stats = config?.stats ?? DEFAULT_STATS;

  return (
    <section id={id || "features"} className="py-12 sm:py-16 bg-white border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <p
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-center text-sm font-semibold uppercase tracking-widest text-rose-500 mb-8"
          >
            {title}
          </p>
        )}
        <div className={cn("grid gap-8", gridColCls[stats.length] ?? "grid-cols-3")}>
          {stats.map((s, i) => (
            <div
              key={i}
              data-scroll-animate="scaleUp"
              data-scroll-delay={`${0.1 * i}`}
              className="flex flex-col items-center text-center"
            >
              <p className="text-4xl font-bold text-gray-900 sm:text-5xl tabular-nums">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Dark cards (Community / Circle.so-inspired) ───────────────────────────────

function DarkFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "Everything your community needs";
  const subtitle = config?.subtitle || "";
  const gridColumns = config?.gridColumns || 3;
  const cols = gridColCls[gridColumns] ?? gridColCls[3];
  const items = DEFAULT_FEATURES.slice(0, gridColumns * 2);

  return (
    <section id={id || "features"} className="py-16 sm:py-20 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            {title && (
              <h2
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.05"
                className="text-2xl font-bold tracking-tight text-white sm:text-4xl"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.15"
                className="mt-2 text-base text-slate-400"
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn("grid gap-5", cols)}>
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.07 * i}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all hover:border-indigo-500/50 hover:bg-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl border border-indigo-500/20">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-6 text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Benefits checklist (Studio/Podia + Creator/Stan) ─────────────────────────

function BenefitsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "Everything you need, right out of the box";
  const subtitle = config?.subtitle || "";
  const gridColumns = config?.gridColumns || 2;
  const cols = gridColCls[gridColumns] ?? gridColCls[2];
  const zeroCostBadge = config?.zeroCostBadge === true;
  const items = DEFAULT_FEATURES.slice(0, 6);

  return (
    <section id={id || "features"} className="py-16 sm:py-20 bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          {zeroCostBadge && (
            <span
              data-scroll-animate="scaleUp"
              data-scroll-delay="0"
              className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-4"
            >
              0% Transaction Fees — Always Free
            </span>
          )}
          {title && (
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              className="mt-3 text-base text-gray-500"
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn("grid gap-4", cols)}>
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="slideLeft"
              data-scroll-delay={`${0.07 * i}`}
              className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-teal-200 hover:bg-teal-50/30"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Studio (Podia-inspired amber/teal split) ──────────────────────────────────

function StudioFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "One place. Everything you need.";
  const subtitle = config?.subtitle || "Your website, your store, your audience — all connected.";
  const items = DEFAULT_FEATURES.slice(0, 3);

  return (
    <section id={id || "features"} className="py-16 sm:py-20 bg-amber-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.05"
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              {title}
            </h2>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.15"
              className="mt-4 text-base text-gray-600 leading-relaxed"
            >
              {subtitle}
            </p>
            <ul className="mt-8 space-y-4">
              {items.map((f, i) => (
                <li
                  key={i}
                  data-scroll-animate="slideLeft"
                  data-scroll-delay={`${0.2 + 0.08 * i}`}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white text-sm font-bold">
                    {f.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{f.title}</p>
                    <p className="text-sm text-gray-500">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            data-scroll-animate="slideRight"
            data-scroll-delay="0.1"
            className="grid grid-cols-2 gap-4"
          >
            {DEFAULT_FEATURES.slice(3).map((f, i) => (
              <div key={i} className="rounded-2xl bg-white border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Creator (Stan.store-inspired violet) ─────────────────────────────────────

function CreatorFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "Built for creators who mean business";
  const subtitle = config?.subtitle || "No middlemen. No platform tax. Just you and your audience.";
  const items = DEFAULT_FEATURES.slice(0, 6);

  return (
    <section id={id || "features"} className="py-16 sm:py-20 bg-violet-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              className="mt-3 text-base text-gray-600"
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.07 * i}`}
              className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-violet-300"
            >
              <div className="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-violet-100 opacity-60 transition-transform group-hover:translate-y-0 group-hover:translate-x-0 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
