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

const featureIcons = ["🎓", "📚", "🏆", "💡", "🚀", "⭐", "✨", "🎯"];

  const features = [
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience",
      icon: "🎓",
    },
    {
      title: "Flexible Learning",
      description: "Study at your own pace with lifetime access to course materials",
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

  if (variant === "icons") {
    return (
      <section id={id || "features"} className="py-8 sm:py-10 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mx-auto max-w-2xl text-center mb-8">
              {title && (
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div
            className={cn(
              "mx-auto grid gap-6",
              gridColClasses[gridColumns],
              "lg:max-w-none"
            )}
          >
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                className="group flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5 text-4xl transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--theme-primary)]/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section id={id || "features"} className="py-8 sm:py-10 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mx-auto max-w-2xl mb-8">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div
            className={cn(
              "mx-auto grid gap-4",
              gridColClasses[gridColumns],
              "lg:max-w-none"
            )}
          >
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[var(--theme-primary)]/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
              >
                {showIcons && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5 text-2xl transition-transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
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
    <section id={id || "features"} className="py-8 sm:py-10 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mx-auto max-w-2xl text-center mb-8">
            {title && (
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {title}
          </h2>
            )}
          {subtitle && (
            <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
        )}
        <div
          className={cn(
            "mx-auto grid gap-6",
            gridColClasses[gridColumns],
            "lg:max-w-none"
          )}
        >
          {displayFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col gap-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
            >
              {/* Decorative gradient background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/5 via-transparent to-[var(--theme-accent)]/5 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative">
                {showIcons && (
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5 text-2xl transition-transform group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--theme-primary)]/20">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-lg font-semibold leading-7 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

