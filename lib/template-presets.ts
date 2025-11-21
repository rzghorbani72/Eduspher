import { UIBlockConfig } from './theme-config';

export type TemplatePreset = 'modern' | 'classic' | 'minimal' | 'courses-first' | 'featured' | 'compact' | 'business';

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
    description: 'Traditional layout with sidebar and structured content',
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
          title: 'Welcome to Our School',
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
        id: 'sidebar',
        type: 'sidebar',
        order: 3,
        isVisible: true,
        config: {
          position: 'left',
          showCategories: true,
          showFilters: true,
        },
      },
      {
        id: 'features',
        type: 'features',
        order: 4,
        isVisible: true,
        config: {
          title: 'Our Features',
          subtitle: '',
          gridColumns: 2,
          showIcons: true,
          variant: 'list',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 5,
        isVisible: true,
        config: {
          title: 'All Courses',
          subtitle: '',
          showFilters: true,
          gridColumns: 2,
          limit: 8,
          layout: 'list',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: false,
          showNewsletter: false,
          columns: 3,
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

  business: {
    id: 'business',
    name: 'Business',
    description: 'Professional layout for corporate training schools',
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
          title: 'Professional Training Solutions',
          subtitle: 'Empower your team with expert-led courses',
          showCTA: true,
          ctaText: 'View Solutions',
          ctaSecondary: 'Contact Sales',
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
          title: 'Enterprise Features',
          subtitle: 'Built for teams and organizations',
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
          title: 'Training Programs',
          subtitle: 'Comprehensive courses for professionals',
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
          title: 'Client Testimonials',
          subtitle: 'Trusted by leading companies',
          layout: 'grid',
          showAvatars: true,
          corporate: true,
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
          showLegal: true,
        },
      },
    ],
  },
};

export function getTemplatePreset(presetId: TemplatePreset): TemplatePresetInfo {
  return TEMPLATE_PRESETS[presetId];
}

export function getAllTemplatePresets(): TemplatePresetInfo[] {
  return Object.values(TEMPLATE_PRESETS);
}

