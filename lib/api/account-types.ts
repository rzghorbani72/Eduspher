/**
 * Types for the student account area.
 *
 * Ids are cuid strings. The older types in `types.ts` declare them as `number`,
 * which silently produced NaN wherever they were parsed — new code must not
 * repeat that.
 */

export type ProfileAvatar = {
  id: string;
  url: string;
  alt: string | null;
};

export type AccountProfile = {
  id: string;
  display_name: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_active: boolean;
  avatar_id: string | null;
  avatar: ProfileAvatar | null;
  role_name: string | null;
  role_label: string | null;
  academy_name: string | null;
  created_at: string;
  last_login: string | null;
};

export type AccountUser = {
  id: string;
  email: string | null;
  phone_number: string | null;
  display_name: string;
  role: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  has_password: boolean;
};

export type AccessCourseRef = {
  id: string;
  title: string;
  cover_url?: string | null;
};

/**
 * `GET /v1/enrollments/my-access` — one row per course the student can open
 * right now, whatever granted it (purchase, subscription, tutoring, group).
 * OWNED never expires; EXPIRING carries the furthest-out date held.
 * Note it carries no progress, so the courses page still joins it against
 * `GET /v1/enrollments`.
 */
export type CourseAccessRow = {
  course_id: string;
  title: string;
  slug: string | null;
  access: "OWNED" | "EXPIRING";
  expires_at: string | null;
};

export type AssignmentSummary = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  max_score: number;
  Lesson?: {
    id: string;
    title: string;
    Season?: { id: string; course_id: string; Course?: AccessCourseRef | null } | null;
  } | null;
};

export type SubmissionSummary = {
  id: string;
  assignment_id: string;
  enrollment_id: string;
  status: string;
  score: number | null;
  feedback: string | null;
  content: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  thread_id: string | null;
  Assignment?: AssignmentSummary | null;
};

/** Mirrors `QuizAttempt` in `lib/api/client.ts`; kept here for server fetches. */
export type QuizAttemptSummary = {
  id: string;
  quiz_id: string;
  status: "IN_PROGRESS" | "PENDING_REVIEW" | "GRADED" | string;
  score: number;
  max_score: number;
  passed?: boolean | null;
  feedback?: string | null;
  Answer?: Array<{
    id: string;
    question_id: string;
    answer_text?: string | null;
    is_correct?: boolean | null;
    awarded_points: number;
  }>;
  Quiz?: {
    id: string;
    title: string;
    lesson_id: string;
  } | null;
};

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentSummary = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  provider: string | null;
  gateway: string | null;
  created_at: string;
  paid_at: string | null;
  refund_amount: number | null;
  discount_amount: number | null;
  Course?: { id: string; title: string; slug: string | null } | null;
  Order?: { id: string; order_number: string; payment_status: string } | null;
};

/** `GET /v1/payments/:id/receipt` — the academy sells, the platform only collects. */
export type PaymentReceipt = {
  invoice_number: string;
  issued_at: string;
  status: string;
  currency: string;
  seller: {
    role: string;
    name: string | null;
    national_id: string | null;
    economic_code: string | null;
    vat_registration_no: string | null;
  };
  collecting_agent: {
    role: string;
    name: string | null;
    economic_code: string | null;
    vat_registration_no: string | null;
  };
  buyer: { name: string | null };
  item: string | null;
  amounts: {
    gross: number;
    discount: number;
    vat_rate: number;
    vat_amount: number;
    platform_commission: number;
    academy_net: number;
    refunded: number;
  };
  moadian_status: string;
};

export type AcademyPlanPublic = {
  id: string;
  name: string;
  description: string | null;
  kind: string;
  price: number;
  duration_days: number | null;
  is_active: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type LegalPendingDocument = {
  type: string;
  version: string;
  title: string;
  content?: string | null;
  locale: string;
};

export type LegalAcceptanceStatus = {
  up_to_date: boolean;
  pending: LegalPendingDocument[];
};

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
