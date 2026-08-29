import type { CourseSummary } from "@/lib/api/types";
import type { CourseContentStats } from "@/lib/courses/curriculum";

interface CourseJsonLdInput {
  course: CourseSummary;
  stats: CourseContentStats;
  canonicalUrl: string;
  academyName: string;
  currency: string;
  imageUrl: string | null;
  /** Cheapest published price, so the rich result matches the buy box. */
  lowPrice: number | null;
}

/** ISO 8601 duration — Google needs "PT2H30M", not "150 minutes". */
const toIsoDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `PT${hours > 0 ? `${hours}H` : ""}${rest > 0 || hours === 0 ? `${rest}M` : ""}`;
};

/**
 * schema.org/Course. `hasCourseInstance` is what makes an academy course
 * eligible for the course rich result — omitting it drops the listing.
 */
export function buildCourseJsonLd({
  course,
  stats,
  canonicalUrl,
  academyName,
  currency,
  imageUrl,
  lowPrice,
}: CourseJsonLdInput): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      course.meta_description?.trim() ||
      course.short_description ||
      course.description ||
      course.title,
    url: canonicalUrl,
    inLanguage: course.language ?? "fa",
    provider: {
      "@type": "Organization",
      name: academyName,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      ...(stats.totalMinutes > 0 && {
        courseWorkload: toIsoDuration(stats.totalMinutes),
      }),
    },
  };

  if (course.keywords?.length) jsonLd.keywords = course.keywords.join(", ");
  if (imageUrl) jsonLd.image = imageUrl;
  if (course.author?.display_name) {
    jsonLd.author = { "@type": "Person", name: course.author.display_name };
  }
  if (course.rating && course.rating > 0 && (course.rating_count ?? 0) > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: course.rating,
      ratingCount: course.rating_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (lowPrice != null) {
    jsonLd.offers = {
      "@type": "Offer",
      price: lowPrice,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      category: course.is_free || lowPrice === 0 ? "Free" : "Paid",
    };
  }

  return jsonLd;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
