export const STEPS = {
  number: '۰۲',
  label: '۶ قدم راه‌اندازی',
  title: 'آکادمی‌ات را در کمتر از ۱۰ دقیقه بساز',
  footnote:
    'با وارد کردن اطلاعات اولیه، آکادمی‌ات همان لحظه آماده است؛ سایت، دوره‌ها و محتوا را بعداً کامل می‌کنی.',
  items: [
    { number: '۰۱', text: 'نام و اطلاعات آکادمی را وارد کن.' },
    { number: '۰۲', text: 'آکادمی همان لحظه ساخته می‌شود.' },
    { number: '۰۳', text: 'یک قالب انتخاب کن.' },
    { number: '۰۴', text: 'سایت را شخصی‌سازی کن.' },
    { number: '۰۵', text: 'دوره و ویدیو اضافه کن.' },
    { number: '۰۶', text: 'سایت را منتشر کن و لینکش را برای دانشجوها بفرست.' },
  ],
  form: {
    nameLabel: 'نام آکادمی',
    nameValue: 'آکادمی ریاضی رخساره',
    urlLabel: 'آدرس',
    urlValue: 'rokhsare.mentoma.ir',
  },
  created: 'آکادمی ساخته شد',
  customize: { brandColor: 'رنگ برند', heroText: 'متن هیرو' },
  uploads: [
    { name: 'جلسه ۰۱ — مقدمه.mp4', percent: '۱۰۰٪', width: 100 },
    { name: 'جلسه ۰۲ — تابع.mp4', percent: '۶۲٪', width: 62 },
  ],
  publish: { url: 'rokhsare.mentoma.ir', button: 'انتشار', done: 'سایت منتشر شد ✓' },
} as const;
