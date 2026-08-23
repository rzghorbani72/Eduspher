export interface MediaAsset {
  id: string;
  publicUrl: string;
  title?: string | null;
  alt?: string | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
}

export interface AuthorSummary {
  id: string;
  display_name: string;
  bio?: string | null;
  expertise?: string | null;
  courses_count?: number;
  Image?: MediaAsset | null;
}

export interface LiveSessionSummary {
  id?: string;
  lesson_id?: string;
  meeting_url?: string | null;
  playback_url?: string | null;
  starts_at: string;
  ends_at?: string | null;
  duration_minutes?: number | null;
  timezone: string;
  recurrence_rule?: string | null;
  recurrence_until?: string | null;
  provider_label?: string | null;
  /** Next time the series actually meets, computed server-side. */
  next_occurrence_at?: string | null;
  notes?: string | null;
}

export type LessonType =
  "VIDEO" | "AUDIO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE";

export interface LessonQuizSummary {
  id: string;
  title: string;
  passing_score: number;
  is_published: boolean;
  _count?: { Question: number };
}

export interface LessonAssignmentSummary {
  id: string;
  title: string;
  due_date?: string | null;
  max_score: number;
  is_required: boolean;
}

export interface LessonSummary {
  id: string;
  course_id?: string;
  title: string;
  description?: string | null;
  content?: string | null;
  duration?: number | null;
  is_free?: boolean;
  is_published?: boolean;
  order?: number | null;
  lesson_type?: LessonType | null;
  /** Absolute date the lesson unlocks, regardless of enrollment date. */
  available_at?: string | null;
  /** Unlocks this many days after the student enrolls (drip content). */
  drip_days_after_enrollment?: number | null;
  allow_download_free?: boolean;
  allow_download_enrollment?: boolean;
  allow_download_subscription?: boolean;
  allow_download_tutoring?: boolean;
  LiveSession?: LiveSessionSummary | null;
  Quiz?: LessonQuizSummary | null;
  Assignment?: LessonAssignmentSummary | null;
  Video?: MediaAsset | null;
  Audio?: MediaAsset | null;
  Document?: MediaAsset | null;
  Image?: MediaAsset | null;
}

export interface SeasonSummary {
  id: string;
  title: string;
  order?: number | null;
  description?: string | null;
  Lesson?: LessonSummary[];
}

export type CourseDifficulty =
  "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type CoursePricingType =
  "FREE" | "ONE_TIME" | "PAYMENT_PLAN" | "SUBSCRIPTION";

export interface CourseSummary {
  id: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  slug: string;
  price: number;
  original_price?: number | null;
  discount_percent?: number | null;
  is_free: boolean;
  is_published: boolean;
  is_featured: boolean;
  is_certificate: boolean;
  pricing_type?: CoursePricingType | null;
  /** null = lifetime access; otherwise access expires this many days after purchase. */
  access_duration_days?: number | null;
  difficulty?: CourseDifficulty | null;
  language?: string | null;
  /** Newline-separated list authored in the panel. */
  requirements?: string | null;
  /** Newline-separated list authored in the panel. */
  learning_outcomes?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_reviews?: number;
  PrerequisiteCourse?: { id: string; title: string; slug: string } | null;
  rating?: number;
  rating_count?: number;
  students_count?: number;
  lessons_count?: number;
  duration?: number | null;
  comments_count?: number;
  author?: AuthorSummary | null;
  Category?: CategorySummary | null;
  Image?: MediaAsset | null;
  Season: Array<SeasonSummary> | null;
  Video?: MediaAsset | null;
  Audio?: MediaAsset | null;
  Profile?: AuthorSummary | null;
  Document?: MediaAsset | null;
  productCourses?: Array<{
    id: string;
    product_id: string;
    course_id: string;
    relation_type: string;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface CourseListPayload {
  courses: CourseSummary[];
  pagination: Pagination;
}

export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  user_state?: unknown;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  excerpt?: string | null;
  read_time?: number | null;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  author?: {
    id: string;
    display_name: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
  featured_image?: MediaAsset | null;
}

export interface StoreSummary {
  id: string;
  name: string;
  slug?: string;
  is_active?: boolean;
  country_code?: string;
  language?: string;
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  primary_verification_method?: "phone" | "email";
  domain?: {
    public_address?: string | null;
    private_address?: string | null;
  } | null;
  images?: { id: number; filename: string }[];
  profiles?: { id: number; role: { name: string } }[];
  cover?: MediaAsset | null;
  logo?: MediaAsset | null;
  favicon?: MediaAsset | null;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: MediaAsset | null;
  /** Platform-curated landing screenshots of the academy's public site. */
  showcase_desktop?: MediaAsset | null;
  showcase_mobile?: MediaAsset | null;
}

export interface StoreDetail extends StoreSummary {
  slug?: string;
  student_count?: number | null;
  mentor_count?: number | null;
  course_count?: number | null;
  average_rating?: number | null;
}

export interface UserProfileSummary {
  id: string;
  display_name: string;
  role: string;
  has_password: boolean;
  email_confirmed?: boolean;
  phone_confirmed?: boolean;
  Academy: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface UserProfilesResponse {
  success: boolean;
  profiles: UserProfileSummary[];
}

export interface AuthAcademyBrief {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  currency?: string;
  currency_symbol?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  roles: string[];
  user: {
    id: string;
    email?: string | null;
    phone_number: string;
    name: string;
    country_code?: string | null;
    preferred_currency?: string | null;
  } | null;
  currentProfile: {
    id: string;
    academyId: string;
    role: string;
    displayName: string;
    isActive: boolean;
    isVerified: boolean;
  } | null;
  currentAcademy: {
    id: string;
    name: string;
    slug: string;
    domain: string;
    currency: string;
    currency_symbol: string;
    currency_position?: string;
  } | null;
  availableAcademies: AuthAcademyBrief[];
  availableProfiles: {
    id: string;
    academyId: string;
    role: string;
    displayName: string;
    isActive: boolean;
    isVerified: boolean;
  }[];
  permissions?: string[];
  expires_at?: string | Date;
}

export interface ProgressSummary {
  id: string;
  lesson_id: string;
  enrollment_id: string;
  status: string;
  completed_at?: string | null;
  watch_time: number;
  last_position: number;
  lesson?: {
    id: string;
    title: string;
    season?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
      } | null;
    } | null;
  } | null;
}

export interface EnrollmentSummary {
  id: string;
  user_id: string;
  course_id: string;
  profile_id: string;
  status: string;
  enrolled_at: string;
  completed_at?: string | null;
  last_accessed: string;
  progress_percent: number;
  course?: CourseSummary | null;
  progress?: ProgressSummary[];
}
