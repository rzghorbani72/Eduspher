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

export function TestimonialsBlock({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || "What Students Say";
  const subtitle = config?.subtitle || "Hear from our community";
  const layout = config?.layout || "grid";
  const showAvatars = config?.showAvatars !== false;
  const corporate = config?.corporate === true;

  const displayTestimonials = corporate ? corporateTestimonials : testimonials;

  if (layout === "carousel") {
    return (
      <section id={id || "testimonials"} className="py-8 sm:py-10 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            )}
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll" style={{ width: 'max-content' }}>
              {[...displayTestimonials, ...displayTestimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-[350px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center gap-4 mb-3">
                    {showAvatars && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5 text-2xl">
                        {testimonial.avatar}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{testimonial.content}"
                  </p>
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
    <section id={id || "testimonials"} className="py-8 sm:py-10 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-4 mb-3">
                {showAvatars && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5 text-2xl transition-transform group-hover:scale-110">
                    {testimonial.avatar}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                  {corporate && (
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xs">⭐</span>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

