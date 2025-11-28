export interface MediaAsset {
  id: number;
  url: string;
  title?: string | null;
  alt?: string | null;
}

export interface CategorySummary {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
}

export interface AuthorSummary {
  id: number;
  display_name: string;
}

export interface LessonSummary {
  id: number;
  title: string;
  description?: string | null;
  duration?: number | null;
  is_free?: boolean;
  order?: number | null;
  video?: MediaAsset | null;
  audio?: MediaAsset | null;
  document?: MediaAsset | null;
}

export interface SeasonSummary {
  id: number;
  title: string;
  order?: number | null;
  description?: string | null;
  lessons?: LessonSummary[];
}

export interface CourseSummary {
  id: number;
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
  rating?: number;
  rating_count?: number;
  students_count?: number;
  lessons_count?: number;
  duration?: number | null;
  comments_count?: number;
  author?: AuthorSummary | null;
  category?: CategorySummary | null;
  cover?: MediaAsset | null;
  seasons?: SeasonSummary[];
  video?: MediaAsset | null;
  audio?: MediaAsset | null;
  document?: MediaAsset | null;
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

export interface ProductSummary {
  id: number;
  title: string;
  short_description?: string | null;
  description?: string | null;
  slug: string;
  price: number;
  original_price?: number | null;
  discount_percent?: number | null;
  product_type: 'DIGITAL' | 'PHYSICAL';
  stock_quantity?: number | null;
  sku?: string | null;
  is_published: boolean;
  is_featured: boolean;
  rating?: number;
  rating_count?: number;
  sales_count?: number;
  weight?: number | null;
  dimensions?: string | null;
  author?: AuthorSummary | null;
  category?: CategorySummary | null;
  cover?: MediaAsset | null;
  reviews_count?: number;
}

export interface ProductListPayload {
  products: ProductSummary[];
  pagination: Pagination;
}

export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  user_state?: unknown;
}

export interface ArticleSummary {
  id: number;
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
    id: number;
    display_name: string;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
  featured_image?: MediaAsset | null;
}

export interface SchoolSummary {
  id: number;
  name: string;
  slug?: string;
  is_active?: boolean;
  country_code?: string;
  primary_verification_method?: 'phone' | 'email';
  domain?: {
    public_address?: string | null;
    private_address?: string | null;
  } | null;
  images?: { id: number; filename: string }[];
  profiles?: { id: number; role: { name: string } }[];
  cover?: MediaAsset | null;
}

export interface SchoolDetail extends SchoolSummary {
  slug?: string;
  student_count?: number | null;
  mentor_count?: number | null;
  course_count?: number | null;
  average_rating?: number | null;
}

export interface UserProfileSummary {
  id: number;
  display_name: string;
  role: string;
  has_password: boolean;
  email_confirmed?: boolean;
  phone_confirmed?: boolean;
  school: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface UserProfilesResponse {
  success: boolean;
  profiles: UserProfileSummary[];
}

export interface AuthResponse {
  message: string;
  access_token: string;
  roles: string[];
  user: {
    id: number;
    email?: string | null;
    phone_number: string;
    name: string;
    country_code?: string | null;
    preferred_currency?: string | null;
  } | null;
  currentProfile: {
    id: number;
    schoolId: number;
    role: string;
    displayName: string;
    isActive: boolean;
    isVerified: boolean;
  } | null;
  availableSchools: {
    id: number;
    name: string;
    slug: string;
    domain: string;
    currency?: string;
    currency_symbol?: string;
  }[];
  availableProfiles: {
    id: number;
    schoolId: number;
    role: string;
    displayName: string;
    isActive: boolean;
    isVerified: boolean;
  }[];
}

export interface ProgressSummary {
  id: number;
  lesson_id: number;
  enrollment_id: number;
  status: string;
  completed_at?: string | null;
  watch_time: number;
  last_position: number;
  lesson?: {
    id: number;
    title: string;
    season?: {
      id: number;
      title: string;
      course?: {
        id: number;
        title: string;
      } | null;
    } | null;
  } | null;
}

export interface EnrollmentSummary {
  id: number;
  user_id: number;
  course_id: number;
  profile_id: number;
  status: string;
  enrolled_at: string;
  completed_at?: string | null;
  last_accessed: string;
  progress_percent: number;
  course?: CourseSummary | null;
  progress?: ProgressSummary[];
}

