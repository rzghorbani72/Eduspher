import { UIBlockConfig } from './theme-config';

export type TemplatePreset = 'modern' | 'classic' | 'minimal' | 'courses-first' | 'featured' | 'compact' | 'academy' | 'student-focused' | 'kajabi' | 'podia' | 'stan' | 'circle';

export interface TemplatePresetInfo {
  id: TemplatePreset;
  name: string;
  description: string;
  preview?: string;
  blocks: UIBlockConfig[];
}

export const TEMPLATE_PRESETS: Record<TemplatePreset, TemplatePresetInfo> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with hero section, features, and course grid',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
          transparent: true,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Transform Your Skills',
          subtitle: 'Join thousands of students learning with us',
          showCTA: true,
          ctaText: 'Explore Courses',
          ctaSecondary: 'Learn More',
          backgroundImage: null,
          overlay: true,
          alignment: 'center',
          height: 'large',
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 3,
        isVisible: true,
        config: {
          title: 'Why Choose Us',
          subtitle: 'Discover what makes us special',
          gridColumns: 3,
          showIcons: true,
          variant: 'cards',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 4,
        isVisible: true,
        config: {
          title: 'Featured Courses',
          subtitle: 'Start your learning journey today',
          showFilters: true,
          gridColumns: 3,
          limit: 6,
          showViewAll: true,
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        order: 5,
        isVisible: true,
        config: {
          title: 'What Students Say',
          subtitle: 'Hear from our community',
          layout: 'grid',
          showAvatars: true,
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: true,
          columns: 4,
        },
      },
    ],
  },

  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional educational layout with structured content and clear navigation',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
          transparent: false,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Welcome to Our Store',
          subtitle: 'Quality education for everyone',
          showCTA: true,
          ctaText: 'Browse Courses',
          backgroundImage: null,
          overlay: false,
          alignment: 'left',
          height: 'medium',
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 3,
        isVisible: true,
        config: {
          title: 'Our Features',
          subtitle: 'What makes our store special',
          gridColumns: 3,
          showIcons: true,
          variant: 'cards',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 4,
        isVisible: true,
        config: {
          title: 'All Courses',
          subtitle: 'Explore our course catalog',
          showFilters: true,
          gridColumns: 3,
          limit: 9,
          layout: 'grid',
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        order: 5,
        isVisible: true,
        config: {
          title: 'Student Reviews',
          subtitle: 'Hear from our community',
          layout: 'grid',
          showAvatars: true,
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: true,
          columns: 4,
        },
      },
    ],
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design focusing on content',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: false,
          transparent: false,
          minimal: true,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Learn Something New',
          subtitle: 'Simple. Effective. Transformative.',
          showCTA: true,
          ctaText: 'Get Started',
          backgroundImage: null,
          overlay: false,
          alignment: 'center',
          height: 'small',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 3,
        isVisible: true,
        config: {
          title: 'Courses',
          subtitle: '',
          showFilters: false,
          gridColumns: 2,
          limit: 4,
          layout: 'minimal',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 4,
        isVisible: true,
        config: {
          showSocialLinks: false,
          showNewsletter: false,
          columns: 2,
          minimal: true,
        },
      },
    ],
  },

  'courses-first': {
    id: 'courses-first',
    name: 'Courses First',
    description: 'Prioritizes course showcase with large course grid',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Browse Our Courses',
          subtitle: 'Find the perfect course for you',
          showCTA: false,
          backgroundImage: null,
          overlay: false,
          alignment: 'center',
          height: 'small',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 3,
        isVisible: true,
        config: {
          title: '',
          subtitle: '',
          showFilters: true,
          gridColumns: 4,
          limit: 12,
          layout: 'grid',
          featured: true,
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 4,
        isVisible: true,
        config: {
          title: 'Learning Benefits',
          subtitle: '',
          gridColumns: 4,
          showIcons: true,
          variant: 'icons',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 5,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: true,
          columns: 4,
        },
      },
    ],
  },

  featured: {
    id: 'featured',
    name: 'Featured Content',
    description: 'Highlights featured courses and testimonials',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
          transparent: true,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Learn From the Best',
          subtitle: 'Premium courses taught by industry experts',
          showCTA: true,
          ctaText: 'View Courses',
          backgroundImage: null,
          overlay: true,
          alignment: 'center',
          height: 'large',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 3,
        isVisible: true,
        config: {
          title: 'Featured Courses',
          subtitle: 'Handpicked courses just for you',
          showFilters: false,
          gridColumns: 3,
          limit: 3,
          layout: 'featured',
          featured: true,
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        order: 4,
        isVisible: true,
        config: {
          title: 'Success Stories',
          subtitle: 'See how our courses changed lives',
          layout: 'carousel',
          showAvatars: true,
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 5,
        isVisible: true,
        config: {
          title: 'Why Join Us',
          subtitle: '',
          gridColumns: 3,
          showIcons: true,
          variant: 'cards',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: true,
          columns: 4,
        },
      },
    ],
  },

  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient layout for maximum content visibility',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
          compact: true,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Start Learning Today',
          subtitle: 'Browse our course catalog',
          showCTA: true,
          ctaText: 'Explore',
          backgroundImage: null,
          overlay: false,
          alignment: 'left',
          height: 'small',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 3,
        isVisible: true,
        config: {
          title: 'All Courses',
          subtitle: '',
          showFilters: true,
          gridColumns: 3,
          limit: 9,
          layout: 'compact',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 4,
        isVisible: true,
        config: {
          showSocialLinks: false,
          showNewsletter: false,
          columns: 3,
          compact: true,
        },
      },
    ],
  },

  academy: {
    id: 'academy',
    name: 'Academy',
    description: 'Professional academic layout perfect for educational institutions',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
          transparent: false,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Excellence in Education',
          subtitle: 'Join our community of learners and achieve your goals',
          showCTA: true,
          ctaText: 'Explore Courses',
          ctaSecondary: 'Learn More',
          backgroundImage: null,
          overlay: true,
          alignment: 'center',
          height: 'large',
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 3,
        isVisible: true,
        config: {
          title: 'Why Choose Our Academy',
          subtitle: 'Quality education with expert instructors',
          gridColumns: 3,
          showIcons: true,
          variant: 'cards',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 4,
        isVisible: true,
        config: {
          title: 'Our Courses',
          subtitle: 'Comprehensive learning programs for all levels',
          showFilters: true,
          gridColumns: 3,
          limit: 6,
          layout: 'grid',
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        order: 5,
        isVisible: true,
        config: {
          title: 'Student Success Stories',
          subtitle: 'Hear from our graduates',
          layout: 'grid',
          showAvatars: true,
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: true,
          columns: 4,
        },
      },
    ],
  },

  'student-focused': {
    id: 'student-focused',
    name: 'Student Focused',
    description: 'Engaging layout designed to inspire and motivate students',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 1,
        isVisible: true,
        config: {
          showLogo: true,
          showNavigation: true,
          navigationStyle: 'horizontal',
          sticky: true,
          transparent: true,
        },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 2,
        isVisible: true,
        config: {
          title: 'Start Your Learning Journey',
          subtitle: 'Discover courses that will transform your future',
          showCTA: true,
          ctaText: 'Browse Courses',
          backgroundImage: null,
          overlay: true,
          alignment: 'center',
          height: 'large',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 3,
        isVisible: true,
        config: {
          title: 'Popular Courses',
          subtitle: 'Join thousands of students already learning',
          showFilters: false,
          gridColumns: 3,
          limit: 6,
          layout: 'grid',
          featured: true,
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 4,
        isVisible: true,
        config: {
          title: 'Learning Benefits',
          subtitle: 'Everything you need to succeed',
          gridColumns: 4,
          showIcons: true,
          variant: 'icons',
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        order: 5,
        isVisible: true,
        config: {
          title: 'What Students Say',
          subtitle: 'Real stories from our community',
          layout: 'carousel',
          showAvatars: true,
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: true,
          columns: 4,
        },
      },
    ],
  },

  kajabi: {
    id: 'kajabi',
    name: 'Expert Academy',
    description: 'Turn your expertise into income — creator-focused with stats, expert profiles, and rich testimonials',
    blocks: [
      { id: 'header', type: 'header', order: 1, isVisible: true, config: { showLogo: true, showNavigation: true, sticky: true } },
      { id: 'hero', type: 'hero', order: 2, isVisible: true, config: { style: 'expert', title: "Turn What You Know Into What You're Known For", subtitle: 'The best online academy platform to build your business.', showCTA: true, ctaText: 'Get Started Free', ctaSecondary: 'View Pricing', alignment: 'center', height: 'large', showExpertPhotos: true } },
      { id: 'features', type: 'features', order: 3, isVisible: true, config: { style: 'stats', title: 'The numbers speak', showStats: true, stats: [{ value: '100K+', label: 'Active students' }, { value: '$10B+', label: 'Earned by creators' }, { value: '75M+', label: 'Customers served' }], gridColumns: 3, variant: 'cards' } },
      { id: 'courses', type: 'courses', order: 4, isVisible: true, config: { title: 'Choose Your Path', subtitle: 'Explore coaching, courses, communities, and more', gridColumns: 3, limit: 6, showFilters: true } },
      { id: 'testimonials', type: 'testimonials', order: 5, isVisible: true, config: { style: 'dark-quote', title: 'Why experts choose us', layout: 'carousel', showAvatars: true } },
      { id: 'footer', type: 'footer', order: 6, isVisible: true, config: { showSocialLinks: true, showNewsletter: true, columns: 4 } },
    ],
  },

  podia: {
    id: 'podia',
    name: 'Studio',
    description: 'All-in-one creator store — website, courses, email, and memberships in one place',
    blocks: [
      { id: 'header', type: 'header', order: 1, isVisible: true, config: { showLogo: true, showNavigation: true, sticky: true, minimal: true } },
      { id: 'hero', type: 'hero', order: 2, isVisible: true, config: { style: 'creator-store', title: 'The all-in-one for teams of one', subtitle: 'Run your website, online store, and email marketing all from one place.', showCTA: true, ctaText: 'Start Your Free Trial', alignment: 'left', height: 'large', showProductCards: true } },
      { id: 'testimonials', type: 'testimonials', order: 3, isVisible: true, config: { style: 'creator-stories', title: 'Their businesses finally found a home', layout: 'grid', showAvatars: true } },
      { id: 'features', type: 'features', order: 4, isVisible: true, config: { style: 'benefits', title: 'Everything you need, right out of the box', gridColumns: 3, variant: 'list', showIcons: true } },
      { id: 'courses', type: 'courses', order: 5, isVisible: true, config: { title: 'Sell anything you can imagine', gridColumns: 3, limit: 6, showFilters: false } },
      { id: 'footer', type: 'footer', order: 6, isVisible: true, config: { showSocialLinks: true, showNewsletter: false, columns: 4 } },
    ],
  },

  stan: {
    id: 'stan',
    name: 'Creator',
    description: 'All-in-one creator store with 0% transaction fees — built for social creators',
    blocks: [
      { id: 'header', type: 'header', order: 1, isVisible: true, config: { showLogo: true, showNavigation: true, sticky: false, transparent: true } },
      { id: 'hero', type: 'hero', order: 2, isVisible: true, config: { style: 'social', title: 'Meet Your All-in-One Creator Store', subtitle: 'Join 100,000+ solo business owners who use this platform.', showCTA: true, ctaText: 'Start Your Trial', ctaSecondary: 'View Demo →', alignment: 'center', height: 'large', gradient: 'purple' } },
      { id: 'testimonials', type: 'testimonials', order: 3, isVisible: true, config: { style: 'social-proof', title: 'See What People Are Saying', layout: 'grid', showAvatars: true } },
      { id: 'features', type: 'features', order: 4, isVisible: true, config: { style: 'benefits', title: '0% Transaction Fees, Always', gridColumns: 2, variant: 'list', showIcons: true, zeroCostBadge: true } },
      { id: 'courses', type: 'courses', order: 5, isVisible: true, config: { title: 'A Simpler Solution', gridColumns: 3, limit: 6, showFilters: false } },
      { id: 'footer', type: 'footer', order: 6, isVisible: true, config: { showSocialLinks: true, showNewsletter: false, columns: 3, minimal: true } },
    ],
  },

  circle: {
    id: 'circle',
    name: 'Community',
    description: 'The community platform for creators — memberships, courses, events, and spaces',
    blocks: [
      { id: 'header', type: 'header', order: 1, isVisible: true, config: { showLogo: true, showNavigation: true, sticky: true, dark: true } },
      { id: 'hero', type: 'hero', order: 2, isVisible: true, config: { style: 'community', title: 'Build Your Online Community', subtitle: 'The all-in-one platform for community-powered businesses.', showCTA: true, ctaText: 'Start for Free', ctaSecondary: 'Watch Demo', alignment: 'center', height: 'large', dark: true } },
      { id: 'features', type: 'features', order: 3, isVisible: true, config: { style: 'dark', title: 'Everything your community needs', gridColumns: 3, variant: 'cards', showIcons: true, dark: true } },
      { id: 'courses', type: 'courses', order: 4, isVisible: true, config: { title: 'Courses & Content', gridColumns: 3, limit: 6, showFilters: false } },
      { id: 'testimonials', type: 'testimonials', order: 5, isVisible: true, config: { style: 'dark-quote', title: 'Loved by community builders', layout: 'carousel', showAvatars: true } },
      { id: 'footer', type: 'footer', order: 6, isVisible: true, config: { showSocialLinks: true, showNewsletter: true, columns: 4, dark: true } },
    ],
  },
};

export function getTemplatePreset(presetId: TemplatePreset): TemplatePresetInfo {
  return TEMPLATE_PRESETS[presetId];
}

export function getAllTemplatePresets(): TemplatePresetInfo[] {
  return Object.values(TEMPLATE_PRESETS);
}

