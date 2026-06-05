"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";

const FAQ_KEYS = [
  {
    q: "آیا بعد از خرید بسته می‌توانم دوره‌ها را جداگانه هم بخرم؟",
    a: "بله، دوره‌های داخل بسته به صورت جداگانه هم قابل خرید هستند. اما با خرید بسته، علاوه بر تخفیف ویژه، به همه دوره‌های داخل بسته دسترسی خواهید داشت.",
  },
  {
    q: "آیا دسترسی مادام‌العمر در بسته‌ها هست؟",
    a: "بله، با خرید هر بسته آموزشی، دسترسی مادام‌العمر به تمام دوره‌های داخل آن بسته خواهید داشت و می‌توانید هر زمان که بخواهید آن‌ها را مشاهده کنید.",
  },
  {
    q: "اگر قبلاً یکی از دوره‌های بسته را خریده باشم چطور؟",
    a: "در این صورت با تیم پشتیبانی تماس بگیرید تا تخفیف معادل آن دوره برای خرید بسته برای شما اعمال شود.",
  },
];

export function BundlesFaq() {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <h2 className="text-center text-2xl font-bold text-[var(--theme-foreground)]">
        {t("bundles.faqTitle") || "سوالات متداول"}
      </h2>
      <div className="mx-auto max-w-2xl space-y-3">
        {FAQ_KEYS.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-theme bg-card overflow-hidden">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between px-5 py-4 text-start text-sm font-semibold text-[var(--theme-foreground)] hover:bg-surface/50 transition-colors"
            >
              <span>{item.q}</span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-muted transition-transform duration-200 ${open === idx ? "rotate-180" : ""}`}
              />
            </button>
            {open === idx && (
              <div className="border-t border-theme px-5 py-4 text-sm leading-7 text-muted">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
