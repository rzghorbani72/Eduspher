/** Copy for the public contact page. Landing-scope pages keep their fa strings
    here, next to the components, exactly like `landing.messages.ts`. */
export const CONTACT = {
  meta: {
    title: 'تماس با ما',
    description: 'تیکت بده، ایمیل بزن یا در موارد فوری تماس بگیر — پشتیبانی منتوما پاسخگوی توست.',
  },

  hero: {
    eyebrow: 'پشتیبانی منتوما',
    titleLead: 'سریع‌ترین راه رسیدن به ما، ',
    titleCircled: 'ثبت تیکت',
    titleAfter: ' است',
    subtitle:
      'تیکت‌ها پیگیری‌شده و ثبت‌شده‌اند؛ هر پیام شماره‌ی پیگیری می‌گیرد و تا حل شدن باز می‌ماند. معمولاً کمتر از یک روز کاری پاسخ می‌دهیم.',
  },

  form: {
    title: 'ثبت تیکت پشتیبانی',
    subtitle: 'فرم را پر کن؛ پاسخ را به همین ایمیل می‌فرستیم.',
    name: 'نام و نام خانوادگی',
    namePlaceholder: 'نام شما',
    email: 'ایمیل',
    emailPlaceholder: 'you@email.com',
    phone: 'شماره تماس (اختیاری)',
    phonePlaceholder: '۰۹۱۲۳۴۵۶۷۸۹',
    category: 'موضوع تیکت',
    subject: 'عنوان',
    subjectPlaceholder: 'در یک جمله بگو موضوع چیست',
    body: 'شرح درخواست',
    bodyPlaceholder:
      'هرچه دقیق‌تر بنویسی، سریع‌تر حل می‌شود: چه کاری کردی، چه انتظاری داشتی، چه دیدی.',
    submit: 'ثبت تیکت',
    submitting: 'در حال ثبت…',
    error: 'ثبت تیکت انجام نشد. لطفاً دوباره تلاش کن یا به info@mentoma.ir ایمیل بزن.',
    successTitle: 'تیکت شما ثبت شد',
    successBody:
      'پاسخ را به ایمیلی که وارد کردی می‌فرستیم. معمولاً کمتر از یک روز کاری طول می‌کشد.',
    successAgain: 'ثبت تیکت جدید',
  },

  categories: [
    { value: 'TECHNICAL', label: 'مشکل فنی' },
    { value: 'BILLING', label: 'پلن و صورتحساب' },
    { value: 'PAYMENT', label: 'پرداخت' },
    { value: 'COURSE_ACCESS', label: 'دسترسی به دوره' },
    { value: 'LIVE_CLASS', label: 'کلاس آنلاین (زنده)' },
    { value: 'CONTENT', label: 'محتوا' },
    { value: 'OTHER', label: 'سایر موارد' },
  ],

  channels: {
    title: 'راه‌های دیگر',
    emailLabel: 'ایمیل',
    emailValue: 'info@mentoma.ir',
    emailHint: 'برای درخواست‌های عمومی، همکاری و فروش',
    phoneLabel: 'تلفن',
    phoneValue: '۰۹۲۱۴۴۳۲۳۰۹',
    phoneHref: 'tel:+989214432309',
    phoneHint: 'فقط برای موارد فوری و گزارش اختلال — درخواست‌های عادی را تیکت کن',
    responseTitle: 'زمان پاسخ',
    responseBody: 'تیکت و ایمیل: کمتر از یک روز کاری',
  },

  loggedIn: {
    title: 'قبلاً حساب داری؟',
    body: 'اگر مدیر یا مدرس آکادمی هستی، از پنل مدیریت تیکت بده؛ اگر دانشجویی، از حساب کاربری‌ات. آنجا تاریخچه‌ی تیکت‌ها و پاسخ‌ها را هم می‌بینی.',
    panelCta: 'ثبت تیکت در پنل مدیریت',
    studentCta: 'ثبت تیکت در حساب کاربری',
  },
} as const;
