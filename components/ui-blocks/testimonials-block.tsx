import { cn } from "@/lib/utils";

interface TestimonialsBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    layout?: "grid" | "carousel";
    showAvatars?: boolean;
    corporate?: boolean;
  };
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Tech Corp",
    content: "This platform transformed my career. The courses are comprehensive and the instructors are world-class.",
    avatar: "👩‍💻",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    company: "StartupXYZ",
    content: "The best investment I've made in my professional development. Highly recommend to anyone serious about learning.",
    avatar: "👨‍💼",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist",
    company: "Data Insights",
    content: "The hands-on projects and real-world applications make all the difference. I landed my dream job thanks to this platform.",
    avatar: "👩‍🔬",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "UX Designer",
    company: "Design Studio",
    content: "The community support and mentorship opportunities are incredible. You're never learning alone here.",
    avatar: "👨‍🎨",
    rating: 5,
  },
  {
    name: "Lisa Anderson",
    role: "Marketing Director",
    company: "Brand Agency",
    content: "Flexible learning schedule fits perfectly with my busy work life. Quality content that's worth every minute.",
    avatar: "👩‍💼",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "CTO",
    company: "Enterprise Solutions",
    content: "Our entire team uses this platform for continuous learning. The ROI has been exceptional.",
    avatar: "👨‍💻",
    rating: 5,
  },
];

const corporateTestimonials = [
  {
    name: "Jennifer Martinez",
    role: "VP of Learning & Development",
    company: "Fortune 500 Corp",
    content: "We've trained over 500 employees using this platform. The enterprise features and reporting capabilities are outstanding.",
    avatar: "👩‍💼",
    rating: 5,
  },
  {
    name: "Robert Taylor",
    role: "HR Director",
    company: "Global Industries",
    content: "The best corporate training solution we've found. Our employee satisfaction scores have increased significantly.",
    avatar: "👨‍💼",
    rating: 5,
  },
  {
    name: "Amanda White",
    role: "Chief Learning Officer",
    company: "Innovation Labs",
    content: "Scalable, reliable, and effective. This platform has become essential to our talent development strategy.",
    avatar: "👩‍💼",
    rating: 5,
  },
];

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-1 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} className="text-sm">⭐</span>
    ))}
  </div>
);

export function TestimonialsBlock({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "What Students Say";
  const subtitle = config?.subtitle || "Hear from our community";
  const layout = config?.layout || "grid";
  const showAvatars = config?.showAvatars !== false;
  const corporate = config?.corporate === true;

  const displayTestimonials = corporate ? corporateTestimonials : testimonials;

  const SectionTitle = () => (
    <div className="mx-auto max-w-2xl text-center mb-8" style={{ color: 'var(--theme-foreground)' }}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-base leading-7 opacity-60">{subtitle}</p>}
    </div>
  );

  const Avatar = ({ emoji }: { emoji: string }) =>
    showAvatars ? (
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: 'var(--theme-secondary-subtle)' }}
      >
        {emoji}
      </div>
    ) : null;

  if (layout === "carousel") {
    return (
      <section
        id={id || "testimonials"}
        className="py-8 sm:py-10"
        style={{ background: 'linear-gradient(180deg, var(--theme-surface-alt), var(--theme-background))', color: 'var(--theme-foreground)' }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle />
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll" style={{ width: 'max-content' }}>
              {[...displayTestimonials, ...displayTestimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-[350px] flex-shrink-0 rounded-theme border p-6 shadow-sm"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-border-color)',
                    color: 'var(--theme-foreground)',
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar emoji={testimonial.avatar} />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm opacity-60">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <Stars count={testimonial.rating} />
                  <p className="text-sm leading-relaxed opacity-70">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default: grid layout
  return (
    <section
      id={id || "testimonials"}
      className="py-8 sm:py-10"
      style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-foreground)' }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionTitle />
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                "group flex flex-col rounded-theme border p-6 shadow-sm",
                "transition-all hover:-translate-y-1 hover:shadow-lg"
              )}
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border-color)',
                color: 'var(--theme-foreground)',
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="transition-transform group-hover:scale-110">
                  <Avatar emoji={testimonial.avatar} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm opacity-55">{testimonial.role}</p>
                  {corporate && <p className="text-xs opacity-40">{testimonial.company}</p>}
                </div>
              </div>
              <Stars count={testimonial.rating} />
              <p className="text-sm leading-relaxed flex-1 opacity-70">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
