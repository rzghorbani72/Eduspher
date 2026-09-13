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
  slug?: string;
  cover_url?: string | null;
};

/**
 * `GET /v1/enrollments/my-access` — one row per course the student can open
 * right now, whatever granted it (purchase, subscription, tutoring, group).
 * OWNED never expires; EXPIRING carries the furthest-out date held.
 * Note it carries no progress, so the courses page still joins it against
 * `GET /v1/enrollments`.
 */
export type CourseAccessType =
  | "STAFF_GRANT"
  | "ONE_TIME"
  | "BUNDLE"
  | "SUBSCRIPTION"
  | "TUTORING";

export type CourseAccessRow = {
  course_id: string;
  title: string;
  slug: string | null;
  access: "OWNED" | "EXPIRING";
  expires_at: string | null;
  access_type: CourseAccessType;
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
    slug?: string;
    Course?: AccessCourseRef | null;
    Season?: {
      id: string;
      course_id: string;
      Course?: AccessCourseRef | null;
    } | null;
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
  /** Bank tracking / RefNum after verify. */
  gateway_id: string | null;
  /** Gateway token / authority before or during checkout. */
  authority: string | null;
  checkout_reference: string | null;
  coupon_code: string | null;
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

export type MyTutoringGroupSlot = {
  weekday: number;
  start_minute: number;
  duration_minutes: number;
  Lesson: { id: string; title: string } | null;
};

export type MyTutoringGroupSession = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  meeting_url?: string | null;
  /** The teacher's name for this meeting; falls back to its topic. */
  title?: string | null;
  notes?: string | null;
  Topic?: { id: string; title: string } | null;
  Lesson?: { id: string; title: string } | null;
  /** Null until the teacher uploads the video of this meeting. */
  recording?: SessionRecording | null;
  /** Handouts the teacher shared after this meeting. */
  Materials?: SessionMaterial[];
};

/** A handout or helper video the teacher left alongside one meeting. */
export type SessionMaterial = {
  id: string;
  title: string;
  order: number;
  kind: "DOCUMENT" | "VIDEO";
  /** Set for videos, so the client can open a secure playback session. */
  video_id: string | null;
  /** Resolved on the server: a video that may not be saved is signed. */
  url: string | null;
  can_download: boolean;
  mime_type: string | null;
  size: number | null;
  duration: number | null;
  poster_url: string | null;
};

export type SessionRecording = {
  video_id: string;
  title: string;
  duration: number | null;
  poster_url: string | null;
  /** Resolved on the server: a recording that may not be saved is signed. */
  can_download: boolean;
  url: string | null;
};

export type ClassAssignment = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  is_required: boolean;
  tutoring_group_id: string | null;
  tutoring_session_id: string | null;
};

export type CourseTopic = {
  id: string;
  title: string;
  description: string | null;
  order: number;
};

export type MyTutoringGroup = {
  id: string;
  title: string;
  description: string | null;
  timezone: string;
  capacity: number;
  seats_taken: number;
  seats_left: number;
  min_students: number;
  status: string;
  starts_on: string | null;
  ends_on: string | null;
  course_id: string;
  Slots: MyTutoringGroupSlot[];
  Tutor: { id: string; display_name: string | null } | null;
  next_session?: {
    id: string;
    starts_at: string;
    ends_at: string | null;
  } | null;
};

export type MyTutoringGroupRow = {
  engagement_id: string;
  engagement_status: string;
  seats_claimed: number;
  group: MyTutoringGroup;
};

export type TutoringGroupRoom = MyTutoringGroup & {
  /** Present only inside the join window — otherwise null, never a stale link. */
  meeting_url: string | null;
  is_tutor: boolean;
  membership: { id: string; status: string; seats_claimed: number } | null;
  next_session: MyTutoringGroupSession | null;
  sessions: MyTutoringGroupSession[];
  topics: CourseTopic[];
  /** Homework for the whole class and for individual meetings. */
  assignments: ClassAssignment[];
  /** True only inside the joining window — drives the Join button. */
  link_open: boolean;
  /** Parents for the two chats: the class together (null for a 1:1), and with the teacher. */
  group_thread_parent: string | null;
  private_thread_parent: string | null;
};

export type StudentCertificate = {
  id: string;
  certificate_number: string;
  issued_at: string;
  Course: { id: string; title: string; slug: string | null } | null;
};

export type CertificateVerification = {
  certificate_number: string;
  issued_at: string;
  is_valid: boolean;
  student_name: string | null;
  course_title: string | null;
  academy_name: string | null;
};
