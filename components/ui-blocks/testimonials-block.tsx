interface TestimonialsBlockProps {
  config?: {
    title?: string;
    subtitle?: string;
    layout?: "grid" | "carousel";
    showAvatars?: boolean;
    corporate?: boolean;
  };
}

export function TestimonialsBlock({ config }: TestimonialsBlockProps) {
  const title = config?.title || "What Students Say";
  const subtitle = config?.subtitle || "Hear from our community";
  const layout = config?.layout || "grid";

  // Mock testimonials data - در آینده می‌توان از API fetch کرد
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content: "Amazing courses with practical examples. Highly recommended!",
    },
    {
      name: "Michael Chen",
      role: "Professional",
      content: "The instructors are knowledgeable and the content is up-to-date.",
    },
    {
      name: "Emily Davis",
      role: "Entrepreneur",
      content: "Perfect balance of theory and practice. Learned so much!",
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
          className={`mx-auto mt-16 grid max-w-2xl gap-8 ${
            layout === "carousel"
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          } sm:mt-20 lg:mx-0 lg:max-w-none`}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-4 rounded-lg border p-8"
            >
              <p className="text-base leading-7 text-foreground">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-x-4">
                {config?.showAvatars && (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
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

