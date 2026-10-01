import { cn } from '@/lib/utils';
import { FeaturesBlockProps } from './shared';

// ── Creative (استودیوی خلاق) — 4 instructor cards on navy ─────────────────────

export const CREATIVE_TEACHER_TONES = [
  'bg-(--theme-primary) text-(--theme-on-primary)',
  'bg-(--theme-accent) text-(--theme-on-accent)',
  'bg-(--theme-primary) text-(--theme-on-primary)',
  'bg-(--theme-accent) text-(--theme-on-accent)',
];

export const CREATIVE_TEACHERS = [
  {
    name: 'لیسا باردوت',
    field: 'تصویرساز',
    rating: '۴.۹★',
    students: '۲۸هزار',
  },
  {
    name: 'دانیل اسکات',
    field: 'طراح دیجیتال',
    rating: '۴.۸★',
    students: '۴۲هزار',
  },
  {
    name: 'آرون درپلین',
    field: 'طراح گرافیک',
    rating: '۴.۹★',
    students: '۵۶هزار',
  },
  {
    name: 'ایمونی لاروسا',
    field: 'هنرمند موشن',
    rating: '۴.۸★',
    students: '۱۹هزار',
  },
];

export function CreativeTeachersFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'از متخصصان خلاق یاد بگیر';
  const subtitle =
    config?.subtitle ||
    'رهبران صنعت که مشتاقانه ابزارها، تکنیک‌ها و تجربیاتشان را با شما به اشتراک می‌گذارند.';
  const teachers = config?.teachers?.length ? config.teachers : CREATIVE_TEACHERS;

  return (
    <section
      id={id || 'teachers'}
      className="bg-(--theme-secondary) py-[80px] text-(--theme-on-secondary)"
    >
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[56px] text-center">
          <h2 className="mb-[12px] text-[36px] font-black text-(--theme-on-secondary)">{title}</h2>
          <p className="mx-auto max-w-[460px] text-[15px] text-(--theme-on-secondary)/65">
            {subtitle}
          </p>
        </div>
        <div className="grid gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((teacher, i) => (
            <div
              key={i}
              className="rounded-[20px] border-[1.5px] border-(--theme-on-secondary)/15 bg-(--theme-on-secondary)/[0.06] p-[28px] text-center transition-all hover:-translate-y-1 hover:border-(--theme-primary)"
            >
              <div
                className={cn(
                  'mx-auto mb-[16px] flex h-[80px] w-[80px] items-center justify-center rounded-full text-[28px] font-black',
                  CREATIVE_TEACHER_TONES[i % CREATIVE_TEACHER_TONES.length],
                )}
              >
                {teacher.name.charAt(0)}
              </div>
              <div className="mb-[4px] text-[15px] font-black text-(--theme-on-secondary)">
                {teacher.name}
              </div>
              <div className="mb-[14px] text-[13px] font-bold text-(--theme-primary)">
                {teacher.field}
              </div>
              <div className="flex justify-center gap-[20px]">
                <div>
                  <div className="text-[17px] font-black text-(--theme-on-secondary)">
                    {teacher.rating}
                  </div>
                  <div className="text-[10px] font-bold text-(--theme-on-secondary)/55">امتیاز</div>
                </div>
                <div>
                  <div className="text-[17px] font-black text-(--theme-on-secondary)">
                    {teacher.students}
                  </div>
                  <div className="text-[10px] font-bold text-(--theme-on-secondary)/55">دانشجو</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
