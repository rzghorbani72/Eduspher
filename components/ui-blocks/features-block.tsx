interface FeaturesBlockProps {
  config?: {
    title?: string;
    subtitle?: string;
    gridColumns?: number;
    showIcons?: boolean;
    variant?: "cards" | "list" | "icons";
  };
}

export function FeaturesBlock({ config }: FeaturesBlockProps) {
  const title = config?.title || "Why Choose Us";
  const subtitle = config?.subtitle || "Discover what makes us special";
  const gridColumns = config?.gridColumns || 3;
  const variant = config?.variant || "cards";

  const gridColClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  // Mock features data - در آینده می‌توان از API fetch کرد
  const features = [
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals",
    },
    {
      title: "Flexible Learning",
      description: "Study at your own pace",
    },
    {
      title: "Certificates",
      description: "Earn recognized certificates",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg leading-8 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`mx-auto mt-16 grid max-w-2xl gap-8 ${gridColClasses[gridColumns]} sm:mt-20 lg:mx-0 lg:max-w-none`}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-4 rounded-lg border p-8"
            >
              {config?.showIcons && (
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {index + 1}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold leading-8">
                {feature.title}
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

