export const NAV = {
  brand: 'منتوما',
  links: [
    { href: '/academies', label: 'نمونه آکادمی‌ها', sectionId: 'samples' },
    { href: '/pricing', label: 'تعرفه و پلن‌ها', sectionId: 'pricing' },
    { href: '/about', label: 'درباره ما', sectionId: undefined },
    { href: '/contact', label: 'تماس با ما', sectionId: undefined },
    { href: '/#features', label: 'امکانات', sectionId: 'features' },
  ],
  login: 'ورود به منتوما',
  cta: 'شروع رایگان',
  menu: 'منوی صفحه',
  themeToggle: 'حالت روشن و تاریک',
  home: 'صفحه اصلی',
} as const;
