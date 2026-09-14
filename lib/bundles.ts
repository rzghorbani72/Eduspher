import type { PublicBundleOffer } from '@/lib/api/server';

type AcademyPlanPackage = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  AcademyPlanCourse: Array<{ Course: { id: string; title: string } }>;
};

/**
 * An academy can sell a multi-course deal two ways: as an AcademyPlan PACKAGE
 * or as an Offer spanning several courses. Students should not have to care, so
 * both are normalised into one shape and bought through the selector that
 * matches their origin.
 */
export type StudentBundle = {
  key: string;
  name: string;
  description: string | null;
  price: number;
  courses: Array<{ id: string; title: string }>;
  selector: { academy_plan_id: string } | { offer_id: string };
};

export const bundleFromPlan = (plan: AcademyPlanPackage): StudentBundle => ({
  key: `plan-${plan.id}`,
  name: plan.name,
  description: plan.description,
  price: plan.price,
  courses: plan.AcademyPlanCourse.map((entry) => entry.Course),
  selector: { academy_plan_id: plan.id },
});

export const bundleFromOffer = (offer: PublicBundleOffer): StudentBundle => ({
  key: `offer-${offer.id}`,
  name: offer.title ?? '',
  description: offer.description,
  price: offer.price,
  courses: offer.Courses.map((entry) => entry.Course),
  selector: { offer_id: offer.id },
});

/** Cheapest first, so the entry-level deal is the first thing a visitor reads. */
export const toStudentBundles = (
  plans: AcademyPlanPackage[],
  offers: PublicBundleOffer[],
): StudentBundle[] =>
  [...plans.map(bundleFromPlan), ...offers.map(bundleFromOffer)].sort((a, b) => a.price - b.price);
