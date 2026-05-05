import { cn } from "@/lib/utils";

interface FeaturesBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    gridColumns?: number;
    showIcons?: boolean;
    variant?: "cards" | "list" | "icons";
  };
}

const features = [
  { title: "Expert Instructors", description: "Learn from industry professionals with years of real-world experience", icon: "🎓" },
  { title: "Flexible Learning", description: "Study at your own pace with lifetime access to course materials", icon: "📚" },
  { title: "Certificates", description: "Earn recognized certificates to boost your career prospects", icon: "🏆" },
  { title: "Interactive Content", description: "Engage with hands-on projects and real-world applications", icon: "💡" },
  { title: "Career Support", description: "Get job placement assistance and career guidance", icon: "🚀" },
  { title: "Community Access", description: "Join a vibrant community of learners and mentors", icon: "⭐" },
];

const sectionStyle = { backgroundColor: 'var(--theme-background)', color: 'var(--theme-foreground)' };
const sectionAltStyle = { backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-foreground)' };

export function FeaturesBlock({ id, config }: FeaturesBlockProps) {
  const title = config?.title || "Why Choose Us";
  const subtitle = config?.subtitle || "Discover what makes us special";
  const gridColumns = config?.gridColumns || 3;
  const variant = config?.variant || "cards";
  const showIcons = config?.showIcons !== false;

  const gridColClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const displayFeatures = features.slice(0, gridColumns * 2);

  const SectionTitle = ({ centered = false }: { centered?: boolean }) =>
    title || subtitle ? (
      <div className={cn("max-w-2xl mb-8", centered && "mx-auto text-center")}>
        {title && <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
        {subtitle && <p className="mt-1 text-base leading-7 opacity-60">{subtitle}</p>}
      </div>
    ) : null;

  const IconBubble = ({ icon }: { icon: string }) => (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
      style={{ backgroundColor: 'var(--theme-primary-subtle)' }}
    >
      {icon}
    </div>
  );

  if (variant === "icons") {
    return (
      <section id={id || "features"} className="py-8 sm:py-10" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle centered />
          <div className={cn("mx-auto grid gap-6 lg:max-w-none", gridColClasses[gridColumns])}>
            {displayFeatures.map((feature, index) => (
              <div key={index} className="group flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl transition-all group-hover:scale-110 group-hover:shadow-lg"
                  style={{ backgroundColor: 'var(--theme-primary-subtle)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 opacity-60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section id={id || "features"} className="py-8 sm:py-10" style={sectionAltStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle />
          <div className={cn("mx-auto grid gap-4 lg:max-w-none", gridColClasses[gridColumns])}>
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 rounded-theme border p-6 transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border-color)',
                  color: 'var(--theme-foreground)',
                }}
              >
                {showIcons && <IconBubble icon={feature.icon} />}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 opacity-60">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default: cards variant
  return (
    <section id={id || "features"} className="py-8 sm:py-10" style={sectionAltStyle}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle centered />
        <div className={cn("mx-auto grid gap-6 lg:max-w-none", gridColClasses[gridColumns])}>
          {displayFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col gap-y-3 rounded-theme border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border-color)',
                color: 'var(--theme-foreground)',
              }}
            >
              {/* Decorative hover gradient */}
              <div className="absolute inset-0 rounded-theme bg-gradient-to-br from-[var(--theme-primary)]/5 via-transparent to-[var(--theme-accent)]/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                {showIcons && <div className="mb-3"><IconBubble icon={feature.icon} /></div>}
                <h3 className="text-lg font-semibold leading-7">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-6 opacity-60">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
