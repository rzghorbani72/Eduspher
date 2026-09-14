'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

const FAQ_KEYS = [
  {
    q: 'آیا بعد از خرید بسته می‌توانم دوره‌ها را جداگانه هم بخرم؟',
    a: 'بله، دوره‌های داخل بسته به صورت جداگانه هم قابل خرید هستند. اما با خرید بسته، علاوه بر تخفیف ویژه، به همه دوره‌های داخل بسته دسترسی خواهید داشت.',
  },
  {
    q: 'آیا دسترسی مادام‌العمر در بسته‌ها هست؟',
    a: 'بله، با خرید هر بسته آموزشی، دسترسی مادام‌العمر به تمام دوره‌های داخل آن بسته خواهید داشت و می‌توانید هر زمان که بخواهید آن‌ها را مشاهده کنید.',
  },
  {
    q: 'اگر قبلاً یکی از دوره‌های بسته را خریده باشم چطور؟',
    a: 'در این صورت با تیم پشتیبانی تماس بگیرید تا تخفیف معادل آن دوره برای خرید بسته برای شما اعمال شود.',
  },
];

export function BundlesFaq() {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 space-y-4 delay-300 duration-500">
      <h2 className="text-center text-2xl font-bold text-[var(--theme-foreground)]">
        {t('bundles.faqTitle') || 'سوالات متداول'}
      </h2>
      <div className="mx-auto max-w-2xl space-y-3">
        {FAQ_KEYS.map((item, idx) => (
          <div key={idx} className="border-theme bg-card overflow-hidden rounded-xl border">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="hover:bg-surface/50 flex w-full items-center justify-between px-5 py-4 text-start text-sm font-semibold text-[var(--theme-foreground)] transition-colors"
            >
              <span>{item.q}</span>
              <ChevronDown
                size={16}
                className={`text-muted shrink-0 transition-transform duration-200 ${open === idx ? 'rotate-180' : ''}`}
              />
            </button>
            {open === idx && (
              <div className="border-theme text-muted border-t px-5 py-4 text-sm leading-7">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
