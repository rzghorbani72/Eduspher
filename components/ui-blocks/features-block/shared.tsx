import { type SlotConfig } from '@/lib/slot-config';

export interface Stat {
  value: string;
  label: string;
}

export interface FeaturesBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    gridColumns?: number;
    showIcons?: boolean;
    variant?: 'cards' | 'list' | 'icons';
    style?:
      | 'default'
      | 'stats'
      | 'dark'
      | 'benefits'
      | 'studio'
      | 'creator'
      | 'instructors'
      | 'flow-cards'
      | 'flow-stats'
      | 'creative-pillars'
      | 'creative-teachers';
    dark?: boolean;
    showStats?: boolean;
    stats?: Stat[];
    zeroCostBadge?: boolean;
    label?: string;
    /** flow-cards / creative-pillars: the feature grid items. */
    items?: { icon?: string; title?: string; description?: string }[];
    /** creative-teachers: instructor cards. */
    teachers?: {
      name: string;
      field: string;
      rating: string;
      students: string;
    }[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

// Module-level English defaults used by sub-style components (kajabi, podia, stan, circle templates)
export const DEFAULT_FEATURES = [
  {
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with years of real-world experience',
    icon: '🎓',
  },
  {
    title: 'Flexible Learning',
    description: 'Study at your own pace with lifetime access to course materials',
    icon: '📚',
  },
  {
    title: 'Certificates',
    description: 'Earn recognized certificates to boost your career prospects',
    icon: '🏆',
  },
  {
    title: 'Interactive Content',
    description: 'Engage with hands-on projects and real-world applications',
    icon: '💡',
  },
  {
    title: 'Career Support',
    description: 'Get job placement assistance and career guidance',
    icon: '🚀',
  },
  {
    title: 'Community Access',
    description: 'Join a vibrant community of learners and mentors',
    icon: '⭐',
  },
];

export const gridColCls: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};
