import type { CourseSummary } from "@/lib/api/types";
import type {
  PublicCourseOffering,
  PublicPaymentPlan,
  PublicTutoringOffer,
} from "@/lib/api/server";

/**
 * Everything a student can buy for one course, flattened into a single ranked
 * list. Offers, installment plans and tutoring subscriptions come from three
 * endpoints but are one decision for the buyer, so they are merged here rather
 * than stacked as three competing cards.
 */

export type PurchaseKind =
  | "FREE"
  | "ONE_TIME"
  | "SUBSCRIPTION"
  | "PRIVATE"
  | "PAYMENT_PLAN"
  | "TUTORING";

export type PurchaseSelector =
  | { offer_id: string }
  | { payment_plan_id: string }
  | { tutoring_offer_id: string }
  | { course_id: string };

export interface PurchaseOptionView {
  key: string;
  kind: PurchaseKind;
  selector: PurchaseSelector;
  title: string | null;
  description: string | null;
  /** Amount charged to start — one installment for a payment plan. */
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  accessDurationDays: number | null;
  /** False = recorded videos only, no live class. */
  includesLive: boolean;
  installments: { count: number; amount: number; intervalDays: number } | null;
  tutorName: string | null;
  sessionsIncluded: number | null;
}

/** Cheapest commitment first, so the page leads with the easiest yes. */
const KIND_ORDER: Record<PurchaseKind, number> = {
  FREE: 0,
  ONE_TIME: 1,
  PAYMENT_PLAN: 2,
  SUBSCRIPTION: 3,
  TUTORING: 4,
  PRIVATE: 5,
};

const fromOffering = (
  offering: PublicCourseOffering,
  course: CourseSummary,
): PurchaseOptionView => {
  // Each offer carries its own "before discount" price. Older offers written
  // before that field existed fall back to the course's own struck-through
  // price, and only when this offer really sells at the course price.
  const ownCompareAt =
    (offering.compare_at_price ?? 0) > offering.price
      ? (offering.compare_at_price ?? null)
      : null;
  const carriesCourseDiscount =
    ownCompareAt === null &&
    offering.type === "ONE_TIME" &&
    offering.price === course.price &&
    (course.original_price ?? 0) > course.price;
  const originalPrice =
    ownCompareAt ??
    (carriesCourseDiscount ? (course.original_price ?? null) : null);

  return {
    key: offering.id,
    kind: offering.type,
    selector: { offer_id: offering.id },
    title: offering.title,
    description: offering.description,
    price: offering.price,
    originalPrice,
    discountPercent:
      originalPrice === null
        ? null
        : carriesCourseDiscount
          ? (course.discount_percent ?? null)
          : Math.round((1 - offering.price / originalPrice) * 100),
    accessDurationDays:
      offering.access_duration_days ?? course.access_duration_days ?? null,
    includesLive: offering.includes_live ?? true,
    installments: null,
    tutorName: null,
    sessionsIncluded: null,
  };
};

const fromPaymentPlan = (plan: PublicPaymentPlan): PurchaseOptionView => ({
  key: plan.id,
  kind: "PAYMENT_PLAN",
  selector: { payment_plan_id: plan.id },
  title: plan.name,
  description: null,
  price: plan.installment_amount,
  originalPrice: null,
  discountPercent: null,
  accessDurationDays: null,
  includesLive: true,
  installments: {
    count: plan.installment_count,
    amount: plan.installment_amount,
    intervalDays: plan.interval_days,
  },
  tutorName: null,
  sessionsIncluded: null,
});

const fromTutoringOffer = (offer: PublicTutoringOffer): PurchaseOptionView => ({
  key: offer.id,
  kind: "TUTORING",
  selector: { tutoring_offer_id: offer.id },
  title: offer.title,
  description: offer.description,
  price: offer.price,
  originalPrice: null,
  discountPercent: null,
  accessDurationDays: offer.duration_days,
  includesLive: true,
  installments: null,
  tutorName: offer.Tutor?.display_name ?? null,
  sessionsIncluded: offer.sessions_included,
});

/**
 * Falls back to the course's own price when the academy has not published any
 * Offer yet, so a freshly created course is still buyable.
 */
const fallbackOption = (course: CourseSummary): PurchaseOptionView => ({
  key: `course-${course.id}`,
  kind: course.is_free ? "FREE" : "ONE_TIME",
  selector: { course_id: course.id },
  title: null,
  description: null,
  price: course.is_free ? 0 : course.price,
  originalPrice:
    (course.original_price ?? 0) > course.price
      ? (course.original_price ?? null)
      : null,
  discountPercent: course.discount_percent ?? null,
  accessDurationDays: course.access_duration_days ?? null,
  includesLive: true,
  installments: null,
  tutorName: null,
  sessionsIncluded: null,
});

export const buildPurchaseOptions = (
  course: CourseSummary,
  offerings: PublicCourseOffering[],
  paymentPlans: PublicPaymentPlan[],
  tutoringOffers: PublicTutoringOffer[],
): PurchaseOptionView[] => {
  const options = [
    ...offerings.filter((o) => o.is_active).map((o) => fromOffering(o, course)),
    ...paymentPlans.map(fromPaymentPlan),
    ...tutoringOffers.map(fromTutoringOffer),
  ];

  if (options.length === 0) options.push(fallbackOption(course));

  return options.sort(
    (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.price - b.price,
  );
};

export const totalOf = (option: PurchaseOptionView): number =>
  option.installments
    ? option.installments.count * option.installments.amount
    : option.price;
