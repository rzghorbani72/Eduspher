/**
 * The ways a student can buy. Nest `POST /payments/checkout` accepts exactly
 * one selector per purchase — storefront and BFF share this list.
 */
export type PurchaseSelector = {
  course_id?: string;
  offer_id?: string;
  academy_plan_id?: string;
  tutoring_offer_id?: string;
  tutoring_group_id?: string;
  payment_plan_id?: string;
};

export const SELECTOR_KEYS = [
  'course_id',
  'offer_id',
  'academy_plan_id',
  'tutoring_offer_id',
  'tutoring_group_id',
  'payment_plan_id',
] as const satisfies readonly (keyof PurchaseSelector)[];
