import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { buildAcademyPath, cn } from "@/lib/utils";
import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { SlotGrid, PlaceholderCard } from "./slot-grid";
import { resolveSlots, type SlotConfig } from "@/lib/slot-config";

interface Stat {
  value: string;
  label: string;
}

interface FeaturesBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    gridColumns?: number;
    showIcons?: boolean;
    variant?: "cards" | "list" | "icons";
    style?:
      | "default"
      | "stats"
      | "dark"
      | "benefits"
      | "studio"
      | "creator"
      | "instructors"
      | "flow-cards"
      | "flow-stats"
      | "creative-pillars"
      | "creative-teachers";
    dark?: boolean;
    showStats?: boolean;
    stats?: Stat[];
    zeroCostBadge?: boolean;
    label?: string;
    /** flow-cards / creative-pillars: the feature grid items. */
    items?: { icon?: string; title?: string; description?: string }[];
    /** creative-teachers: instructor cards. */
    teachers?: {
      name: string;
      field: string;
      rating: string;
      students: string;
    }[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

const DEFAULT_INSTRUCTORS = [
  {
    name: "علی محمدی",
    role: "مهندس ارشد فرانت‌اند در دیجی‌کالا",
    experience: "۸+ سال",
    students: "۲,۴۰۰",
    avatar: "👨‍💻",
  },
  {
    name: "سارا احمدی",
    role: "توسعه‌دهنده بک‌اند در اسنپ",
    experience: "۶+ سال",
    students: "۱,۸۰۰",
    avatar: "👩‍💻",
  },
  {
    name: "رضا کریمی",
    role: "مدرس دوره‌های هوش مصنوعی",
    experience: "۱۰+ سال",
    students: "۳,۱۰۰",
    avatar: "🧑‍🏫",
  },
  {
    name: "مریم رضایی",
    role: "مهندس DevOps در آپارات",
    experience: "۷+ سال",
    students: "۲,۰۰۰",
    avatar: "👩‍🔧",
  },
  {
    name: "امیر حسینی",
    role: "مدیر فنی و مدرس معماری نرم‌افزار",
    experience: "۱۲+ سال",
    students: "۴,۵۰۰",
    avatar: "🧑‍💼",
  },
  {
    name: "نگار صادقی",
    role: "توسعه‌دهنده موبایل در دیوار",
    experience: "۵+ سال",
    students: "۱,۵۰۰",
    avatar: "👩‍🚀",
  },
];

const DEFAULT_INSTRUCTOR_METRICS = [
  { value: "۸+ سال", label: "میانگین سابقه کاری" },
  { value: "۹۴٪", label: "نرخ رضایت دانش‌آموزان" },
  { value: "۸۵ نفر", label: "مدرس فعال" },
  { value: "۲۴/۷", label: "پشتیبانی آنلاین" },
];

// Module-level English defaults used by sub-style components (kajabi, podia, stan, circle templates)
const DEFAULT_FEATURES = [
  {
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of real-world experience",
    icon: "🎓",
  },
  {
    title: "Flexible Learning",
    description:
      "Study at your own pace with lifetime access to course materials",
    icon: "📚",
  },
  {
    title: "Certificates",
    description: "Earn recognized certificates to boost your career prospects",
    icon: "🏆",
  },
  {
    title: "Interactive Content",
    description: "Engage with hands-on projects and real-world applications",
    icon: "💡",
  },
  {
    title: "Career Support",
    description: "Get job placement assistance and career guidance",
    icon: "🚀",
  },
  {
    title: "Community Access",
    description: "Join a vibrant community of learners and mentors",
    icon: "⭐",
  },
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

export async function FeaturesBlock({ id, config }: FeaturesBlockProps) {
  const blockStyle = config?.style ?? "default";

  if (blockStyle === "flow-cards")
    return <FlowCardsFeatures id={id} config={config} />;
  if (blockStyle === "flow-stats")
    return <FlowStatsFeatures id={id} config={config} />;
  if (blockStyle === "creative-pillars")
    return <CreativePillarsFeatures id={id} config={config} />;
  if (blockStyle === "creative-teachers")
    return <CreativeTeachersFeatures id={id} config={config} />;
  if (blockStyle === "stats") return <StatsFeatures id={id} config={config} />;
  if (blockStyle === "dark") return <DarkFeatures id={id} config={config} />;
  if (blockStyle === "instructors")
    return <InstructorsFeatures id={id} config={config} />;
  if (blockStyle === "benefits")
    return <BenefitsFeatures id={id} config={config} />;
  if (blockStyle === "studio")
    return <StudioFeatures id={id} config={config} />;
  if (blockStyle === "creator")
    return <CreatorFeatures id={id} config={config} />;

  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const tr = (key: string) => t(key, language);

  const localizedFeatures = [
    {
      title: tr("blocks.expertInstructors"),
      description: tr("blocks.expertInstructorsDesc"),
      icon: "🎓",
    },
    {
      title: tr("blocks.flexibleLearning"),
      description: tr("blocks.flexibleLearningDesc"),
      icon: "📚",
    },
    {
      title: tr("blocks.certificates"),
      description: tr("blocks.certificatesDesc"),
      icon: "🏆",
    },
    {
      title: tr("blocks.interactiveContent"),
      description: tr("blocks.interactiveContentDesc"),
      icon: "💡",
    },
    {
      title: tr("blocks.careerSupport"),
      description: tr("blocks.careerSupportDesc"),
      icon: "🚀",
    },
    {
      title: tr("blocks.communityAccess"),
      description: tr("blocks.communityAccessDesc"),
      icon: "⭐",
    },
  ];

  const title = config?.title || "Why Choose Us";
  const subtitle = config?.subtitle || "Discover what makes us special";
  const gridColumns = config?.gridColumns || 3;
  const variant = config?.variant || "cards";
  const showIcons = config?.showIcons !== false;
  const items = localizedFeatures.slice(0, gridColumns * 2);

  const renderTitle = (centered = false) => (
    <div className={cn("max-w-2xl mb-12", centered && "mx-auto text-center")}>
      {title ? (
        <>
          <p
            data-scroll-animate="fadeIn"
            data-scroll-delay="0"
            data-editable="title"
            className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-(--theme-primary)"
          >
            {title}
          </p>
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.08"
            data-editable="subtitle"
            data-editable-kind="rich"
            className="text-3xl font-black tracking-tight sm:text-4xl text-(--theme-foreground)"
            style={{ letterSpacing: "-0.025em" }}
            dangerouslySetInnerHTML={{ __html: subtitle || title }}
          />
        </>
      ) : subtitle ? (
        <h2
          data-scroll-animate="fadeIn"
          data-scroll-delay="0.05"
          data-editable="subtitle"
          data-editable-kind="rich"
          className="text-3xl font-black tracking-tight sm:text-4xl text-(--theme-foreground)"
          style={{ letterSpacing: "-0.025em" }}
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
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
      <section
        id={id || "features"}
        className="py-16 sm:py-20 bg-(--theme-surface-alt) text-(--theme-foreground)"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderTitle(true)}
          <SlotGrid config={config} minBasisFallback="220px">
            {resolveSlots(items, config?.slots, items.length).map((slot, i) =>
              slot.kind === "live" ? (
                <div
                  key={i}
                  data-scroll-animate="fadeInUp"
                  data-scroll-delay={`${0.05 * i}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl transition-all group-hover:scale-110 bg-(--theme-primary-subtle)">
                    {slot.data.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{slot.data.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--theme-foreground)/60">
                    {slot.data.description}
                  </p>
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

  if (variant === "list") {
    return (
      <section
        id={id || "features"}
        className="py-16 sm:py-20 bg-(--theme-surface-alt) text-(--theme-foreground)"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderTitle(false)}
          <SlotGrid config={config} minBasisFallback="280px">
            {resolveSlots(items, config?.slots, items.length).map((slot, i) =>
              slot.kind === "live" ? (
                <div
                  key={i}
                  data-scroll-animate="slideLeft"
                  data-scroll-delay={`${0.08 * i}`}
                  className="group flex h-full items-start gap-4 rounded-xl border p-6 transition-all hover:shadow-md bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)"
                >
                  {showIcons && <IconBubble icon={slot.data.icon} />}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{slot.data.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-(--theme-foreground)/60">
                      {slot.data.description}
                    </p>
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

  // cards variant (default)
  return (
    <section
      id={id || "features"}
      className="py-16 sm:py-20 bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {renderTitle(true)}
        <SlotGrid config={config} minBasisFallback="280px">
          {resolveSlots(items, config?.slots, items.length).map((slot, i) =>
            slot.kind === "live" ? (
              <div
                key={i}
                data-scroll-animate="fadeInUp"
                data-scroll-delay={`${0.08 * i}`}
                className="group relative flex h-full flex-col gap-y-3 rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl bg-(--theme-card-bg) border-(--theme-border-color) text-(--theme-foreground)"
              >
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-(--theme-primary)/5 via-transparent to-(--theme-accent)/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                <div className="relative">
                  {showIcons && (
                    <div className="mb-3">
                      <IconBubble icon={slot.data.icon} />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold leading-7">
                    {slot.data.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-(--theme-foreground)/60">
                    {slot.data.description}
                  </p>
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

// ── Stats strip (Expert Academy / Kajabi-inspired) ────────────────────────────

function StatsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title;
  const stats = config?.stats ?? DEFAULT_STATS;

  return (
    <section
      id={id || "features"}
      className="py-12 sm:py-16 bg-(--theme-primary) text-(--theme-on-primary)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <p
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-center text-sm font-semibold uppercase tracking-widest text-(--theme-on-primary)/80 mb-8"
          >
            {title}
          </p>
        )}
        <div
          className={cn(
            "grid gap-8",
            gridColCls[stats.length] ?? "grid-cols-3",
          )}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              data-scroll-animate="scaleUp"
              data-scroll-delay={`${0.1 * i}`}
              className="flex flex-col items-center text-center"
            >
              <p className="text-4xl font-bold sm:text-5xl tabular-nums">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-(--theme-on-primary)/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Instructors showcase (code / dark academy templates) ─────────────────────

function InstructorsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "از متخصصان واقعی صنعت یاد بگیر";
  const subtitle = config?.subtitle;
  const lead = DEFAULT_INSTRUCTORS[0];
  const metrics = DEFAULT_INSTRUCTOR_METRICS;

  return (
    <section
      id={id || "features"}
      className="py-16 sm:py-24 bg-(--theme-surface-alt) text-(--theme-foreground) border-t border-(--theme-border-color)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p
              data-scroll-animate="fadeIn"
              className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-(--theme-primary)"
            >
              مدرسان برتر
            </p>
            <h2
              data-scroll-animate="slideRight"
              className="text-2xl font-bold tracking-tight sm:text-4xl text-(--theme-foreground)"
            >
              {title}
            </h2>
            {subtitle && (
              <p
                data-scroll-animate="slideRight"
                data-scroll-delay="0.1"
                className="mt-3 text-base leading-relaxed text-(--theme-foreground)/60"
              >
                {subtitle}
              </p>
            )}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  data-scroll-animate="fadeInUp"
                  data-scroll-delay={`${0.08 * i}`}
                  className="rounded-2xl border p-5 bg-(--theme-card-bg) border-(--theme-border-color)"
                >
                  <p className="text-2xl font-bold text-(--theme-primary) sm:text-3xl">
                    {m.value}
                  </p>
                  <p className="mt-1 text-sm text-(--theme-foreground)/60">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              asChild
              className="mt-8 bg-(--theme-primary) text-(--theme-on-primary) rounded-full hover:opacity-90"
            >
              <Link href={buildAcademyPath(null, "/courses")}>
                مشاهده همه مدرسان
              </Link>
            </Button>
          </div>

          <div
            data-scroll-animate="slideLeft"
            className="order-first lg:order-last"
          >
            <div className="relative mx-auto aspect-4/5 w-full max-w-sm overflow-hidden rounded-3xl border border-(--theme-border-color) bg-(--theme-primary-subtle)">
              <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-90">
                {lead.avatar}
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-(--theme-card-bg)/90 px-4 py-3 backdrop-blur">
                <p className="text-sm font-semibold text-(--theme-foreground)">
                  {lead.name}
                </p>
                <p className="text-xs text-(--theme-foreground)/60">
                  {lead.role}
                </p>
              </div>
            </div>
          </div>
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
    <section
      id={id || "features"}
      className="py-16 sm:py-20 bg-(--theme-background) text-(--theme-foreground)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            {title && (
              <h2
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.05"
                className="text-2xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.15"
                className="mt-2 text-base text-(--theme-foreground)/60"
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
              className="group flex flex-col gap-3 rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 transition-all hover:border-(--theme-primary)/50 hover:bg-(--theme-surface-alt)"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--theme-primary-subtle) text-2xl border border-(--theme-primary)/20">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-(--theme-foreground)">
                {f.title}
              </h3>
              <p className="text-sm leading-6 text-(--theme-foreground)/60">
                {f.description}
              </p>
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
    <section
      id={id || "features"}
      className="py-16 sm:py-20 bg-(--theme-background) text-(--theme-foreground)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          {zeroCostBadge && (
            <span
              data-scroll-animate="scaleUp"
              data-scroll-delay="0"
              className="inline-flex items-center rounded-full bg-(--theme-primary-subtle) px-3 py-1 text-xs font-semibold text-(--theme-primary) mb-4"
            >
              0% Transaction Fees — Always Free
            </span>
          )}
          {title && (
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-2xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              className="mt-3 text-base text-(--theme-foreground)/60"
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
              className="group flex items-start gap-4 rounded-2xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-5 transition-all hover:border-(--theme-primary)/40 hover:bg-(--theme-primary-subtle)"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-(--theme-primary)">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-(--theme-foreground)">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-(--theme-foreground)/60 leading-relaxed">
                  {f.description}
                </p>
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
  const subtitle =
    config?.subtitle ||
    "Your website, your store, your audience — all connected.";
  const items = DEFAULT_FEATURES.slice(0, 3);

  return (
    <section
      id={id || "features"}
      className="py-16 sm:py-20 bg-(--theme-surface-alt)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.05"
              className="text-3xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
            >
              {title}
            </h2>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.15"
              className="mt-4 text-base text-(--theme-foreground)/70 leading-relaxed"
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
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--theme-primary) text-(--theme-on-primary) text-sm font-bold">
                    {f.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-(--theme-foreground)">
                      {f.title}
                    </p>
                    <p className="text-sm text-(--theme-foreground)/60">
                      {f.description}
                    </p>
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
              <div
                key={i}
                className="rounded-2xl bg-(--theme-card-bg) border border-(--theme-border-color) p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-(--theme-foreground) text-sm">
                  {f.title}
                </h3>
                <p className="mt-1 text-xs text-(--theme-foreground)/60">
                  {f.description}
                </p>
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
  const subtitle =
    config?.subtitle ||
    "No middlemen. No platform tax. Just you and your audience.";
  const items = DEFAULT_FEATURES.slice(0, 6);

  return (
    <section
      id={id || "features"}
      className="py-16 sm:py-20 bg-(--theme-surface-alt)"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-3xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              className="mt-3 text-base text-(--theme-foreground)/70"
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
              className="group relative overflow-hidden rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-(--theme-primary)/40"
            >
              <div className="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-(--theme-primary-subtle) opacity-60 transition-transform group-hover:translate-y-0 group-hover:translate-x-0 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--theme-primary-subtle) text-2xl">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-(--theme-foreground)">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-(--theme-foreground)/60 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Flow (منتوما) — "why" card grid ────────────────────────────────────────

const FLOW_WHY_ITEMS = [
  {
    icon: "📐",
    title: "تمرکز بر عمل",
    description:
      "هر دوره شامل پروژه‌های واقعی و تمرین‌هایی است که یادگیری را به مهارت‌های پایدار تبدیل می‌کند.",
  },
  {
    icon: "⏱",
    title: "با سرعت خودت یاد بگیر",
    description:
      "دروس کوچک متناسب با برنامه‌ات. دقیقاً از همان‌جا که ماندی ادامه بده، از هر دستگاهی.",
  },
  {
    icon: "🏅",
    title: "گواهینامه کسب کن",
    description:
      "با گواهینامه‌های تأییدشده برای هر دوره تکمیل‌شده، مستقیم به لینکدین اضافه کن.",
  },
  {
    icon: "🧑‍🏫",
    title: "مربیان متخصص",
    description:
      "از متخصصانی یاد بگیر که در شرکت‌های برتر کار می‌کنند و تجربه میدانی دارند.",
  },
  {
    icon: "🗺",
    title: "مسیرهای ساختارمند",
    description:
      "مسیرهای یادگیری طراحی‌شده که تو را از صفر تا آماده‌ی کار می‌رسانند بدون سردرگمی.",
  },
  {
    icon: "👥",
    title: "جامعه فعال",
    description:
      "به جامعه ۱۲٬۰۰۰+ یادگیرنده بپیوند. کارت را به اشتراک بذار، بازخورد بگیر، رشد کن.",
  },
];

function FlowCardsFeatures({ id, config }: FeaturesBlockProps) {
  const label = config?.label || "چرا منتوما";
  const title = config?.title || "همه آنچه برای رشد مهارت‌هایت نیاز داری";
  const subtitle =
    config?.subtitle ||
    "مسیرهای یادگیری ساختارمند، مربیان متخصص، و جامعه‌ای که در هر قدم مسئولیت‌پذیرت نگه می‌دارد.";
  const items = config?.items?.length ? config.items : FLOW_WHY_ITEMS;

  return (
    <section
      id={id || "features"}
      className="mx-auto max-w-[1240px] px-[48px] py-[60px]"
    >
      <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">
        {label}
      </div>
      <div className="grid items-end gap-[16px] md:grid-cols-2">
        <div className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.3] text-(--theme-foreground)">
          {title}
        </div>
        <div className="max-w-[520px] text-[15px] leading-[1.85] text-(--theme-muted)">
          {subtitle}
        </div>
      </div>
      <div className="mt-[36px] grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[32px] transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="mb-[20px] flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-(--theme-primary-subtle) text-[22px]">
              {item.icon}
            </div>
            <h3 className="mb-[8px] text-[15px] font-bold text-(--theme-foreground)">
              {item.title}
            </h3>
            <p className="text-[13px] leading-[1.8] text-(--theme-muted)">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Flow (منتوما) — secondary-tone stats bar ───────────────────────────────

const FLOW_STATS: Stat[] = [
  { value: "۱۲هزار+", label: "یادگیرنده فعال" },
  { value: "۹۴٪", label: "نرخ تکمیل" },
  { value: "۳۲۰+", label: "مربی متخصص" },
  { value: "۴.۹★", label: "میانگین امتیاز" },
];

function FlowStatsFeatures({ id, config }: FeaturesBlockProps) {
  const stats = config?.stats?.length ? config.stats : FLOW_STATS;

  return (
    <section
      id={id || "stats"}
      className="bg-(--theme-secondary) px-[48px] py-[52px]"
    >
      <div className="mx-auto grid max-w-[1240px] gap-[40px] text-center sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="mb-[8px] text-[48px] font-black leading-none text-(--theme-primary)">
              {s.value}
            </div>
            <div className="text-[14px] font-medium text-(--theme-on-secondary)/70">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Creative (استودیوی خلاق) — 3 pillar cards with tinted icon ────────────────

const CREATIVE_PILLAR_ICON_TONES = [
  "bg-(--theme-primary-subtle)",
  "bg-(--theme-secondary-subtle)",
  "bg-(--theme-accent-subtle)",
];

const CREATIVE_PILLARS = [
  {
    icon: "🌟",
    title: "انگیزه بگیر",
    description:
      "موضوعات پرطرفدار را کشف کن، از مدرسان جواب بگیر، و قبیله خلاقانه خودت را پیدا کن.",
  },
  {
    icon: "🤝",
    title: "ارتباط بساز",
    description:
      "همتایان و مدرسان را دنبال کن، دیدگاه‌ها را تبادل کن، و از سفر یادگیری همدیگر حمایت کن.",
  },
  {
    icon: "🚀",
    title: "بساز و رشد کن",
    description:
      "ایده‌های جدید برای پروژه کشف کن، کارت را به اشتراک بذار، و بازخورد واقعی از متخصصان بگیر.",
  },
];

function CreativePillarsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "همه چیز برای رشد خلاقانه";
  const items = config?.items?.length ? config.items : CREATIVE_PILLARS;

  return (
    <section
      id={id || "features"}
      className="bg-(--theme-background) py-[80px]"
    >
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="text-center text-[22px] font-black text-(--theme-foreground)">
          {title}
        </div>
        <div className="mt-[48px] grid gap-[32px] md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-[20px] border-2 border-(--theme-border-color) bg-(--theme-surface) p-[36px] px-[32px] text-center transition-all hover:-translate-y-1 hover:border-(--theme-primary)"
            >
              <div
                className={cn(
                  "mx-auto mb-[20px] flex h-[72px] w-[72px] items-center justify-center rounded-[20px] text-[32px]",
                  CREATIVE_PILLAR_ICON_TONES[
                    i % CREATIVE_PILLAR_ICON_TONES.length
                  ],
                )}
              >
                {item.icon}
              </div>
              <h3 className="mb-[10px] text-[17px] font-black text-(--theme-foreground)">
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.8] text-(--theme-muted)">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Creative (استودیوی خلاق) — 4 instructor cards on navy ─────────────────────

const CREATIVE_TEACHER_TONES = [
  "bg-(--theme-primary) text-(--theme-on-primary)",
  "bg-(--theme-accent) text-(--theme-on-accent)",
  "bg-(--theme-primary) text-(--theme-on-primary)",
  "bg-(--theme-accent) text-(--theme-on-accent)",
];

const CREATIVE_TEACHERS = [
  {
    name: "لیسا باردوت",
    field: "تصویرساز",
    rating: "۴.۹★",
    students: "۲۸هزار",
  },
  {
    name: "دانیل اسکات",
    field: "طراح دیجیتال",
    rating: "۴.۸★",
    students: "۴۲هزار",
  },
  {
    name: "آرون درپلین",
    field: "طراح گرافیک",
    rating: "۴.۹★",
    students: "۵۶هزار",
  },
  {
    name: "ایمونی لاروسا",
    field: "هنرمند موشن",
    rating: "۴.۸★",
    students: "۱۹هزار",
  },
];

function CreativeTeachersFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "از متخصصان خلاق یاد بگیر";
  const subtitle =
    config?.subtitle ||
    "رهبران صنعت که مشتاقانه ابزارها، تکنیک‌ها و تجربیاتشان را با شما به اشتراک می‌گذارند.";
  const teachers = config?.teachers?.length
    ? config.teachers
    : CREATIVE_TEACHERS;

  return (
    <section
      id={id || "teachers"}
      className="bg-(--theme-secondary) py-[80px] text-(--theme-on-secondary)"
    >
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[56px] text-center">
          <h2 className="mb-[12px] text-[36px] font-black text-(--theme-on-secondary)">
            {title}
          </h2>
          <p className="mx-auto max-w-[460px] text-[15px] text-(--theme-on-secondary)/65">
            {subtitle}
          </p>
        </div>
        <div className="grid gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((teacher, i) => (
            <div
              key={i}
              className="rounded-[20px] border-[1.5px] border-(--theme-on-secondary)/15 bg-(--theme-on-secondary)/[0.06] p-[28px] text-center transition-all hover:-translate-y-1 hover:border-(--theme-primary)"
            >
              <div
                className={cn(
                  "mx-auto mb-[16px] flex h-[80px] w-[80px] items-center justify-center rounded-full text-[28px] font-black",
                  CREATIVE_TEACHER_TONES[i % CREATIVE_TEACHER_TONES.length],
                )}
              >
                {teacher.name.charAt(0)}
              </div>
              <div className="mb-[4px] text-[15px] font-black text-(--theme-on-secondary)">
                {teacher.name}
              </div>
              <div className="mb-[14px] text-[13px] font-bold text-(--theme-primary)">
                {teacher.field}
              </div>
              <div className="flex justify-center gap-[20px]">
                <div>
                  <div className="text-[17px] font-black text-(--theme-on-secondary)">
                    {teacher.rating}
                  </div>
                  <div className="text-[10px] font-bold text-(--theme-on-secondary)/55">
                    امتیاز
                  </div>
                </div>
                <div>
                  <div className="text-[17px] font-black text-(--theme-on-secondary)">
                    {teacher.students}
                  </div>
                  <div className="text-[10px] font-bold text-(--theme-on-secondary)/55">
                    دانشجو
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
