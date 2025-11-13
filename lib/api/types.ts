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
  author?: AuthorSummary | null;
  category?: CategorySummary | null;
  cover?: MediaAsset | null;
  seasons?: { id: number; title: string }[];
  video?: MediaAsset | null;
  audio?: MediaAsset | null;
  document?: MediaAsset | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
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
  is_active?: boolean;
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
}

export interface UserProfileSummary {
  id: number;
  display_name: string;
  role: string;
  has_password: boolean;
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

