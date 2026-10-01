import { type SlotConfig } from '@/lib/slot-config';

export interface TestimonialsBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'carousel';
    showAvatars?: boolean;
    corporate?: boolean;
    style?:
      | 'default'
      | 'dark-quote'
      | 'social-proof'
      | 'creator-stories'
      | 'studio'
      | 'creator'
      | 'flow'
      | 'code'
      | 'creative';
    label?: string;
    /** flow: testimonial cards. */
    items?: {
      quote?: string;
      name?: string;
      role?: string;
      initials?: string;
    }[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

// Module-level English defaults used by sub-style components (kajabi, podia, stan, circle templates)
export const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'Tech Corp',
    content:
      'This platform transformed my career. The courses are comprehensive and the instructors are world-class.',
    avatar: '👩‍💻',
    revenue: '$12K/mo',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'StartupXYZ',
    content:
      "The best investment I've made in my professional development. Highly recommend to anyone serious about learning.",
    avatar: '👨‍💼',
    revenue: '$8K/mo',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist',
    company: 'Data Insights',
    content:
      'The hands-on projects make all the difference. I landed my dream job thanks to this platform.',
    avatar: '👩‍🔬',
    revenue: '$15K/mo',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'UX Designer',
    company: 'Design Studio',
    content:
      "The community support and mentorship opportunities are incredible. You're never learning alone here.",
    avatar: '👨‍🎨',
    revenue: '$9K/mo',
    rating: 5,
  },
  {
    name: 'Lisa Anderson',
    role: 'Marketing Director',
    company: 'Brand Agency',
    content:
      "Flexible learning schedule fits perfectly with my busy work life. Quality content that's worth every minute.",
    avatar: '👩‍💼',
    revenue: '$20K/mo',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'CTO',
    company: 'Enterprise Solutions',
    content:
      'Our entire team uses this platform for continuous learning. The ROI has been exceptional.',
    avatar: '👨‍💻',
    revenue: '$50K/mo',
    rating: 5,
  },
];
