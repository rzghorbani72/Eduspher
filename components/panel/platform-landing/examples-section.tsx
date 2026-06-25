"use client";

import { useRef } from "react";

const academies = [
  { label: "UI", tag: "طراحی", bg: "linear-gradient(135deg,#7c6cff,#4f8cff)", name: "دیزاین‌لب", desc: "آموزش طراحی UI/UX از صفر تا پروژه واقعی", meta: "۱۲ دوره · ۸٬۴۰۰ دانشجو" },
  { label: "{ }", tag: "برنامه‌نویسی", bg: "linear-gradient(135deg,#34e1a3,#15b8c4)", name: "کدآموز", desc: "دوره‌های فول‌استک، از مبانی تا اشتغال", meta: "۳۴ دوره · ۲۱٬۰۰۰ دانشجو" },
  { label: "Aa", tag: "زبان", bg: "linear-gradient(135deg,#ffb86b,#ff7a59)", name: "زبان‌یار", desc: "آموزش زبان با تمرین تعاملی و آزمون آنلاین", meta: "۱۸ دوره · ۱۵٬۲۰۰ دانشجو" },
  { label: "$", tag: "بیزینس", bg: "linear-gradient(135deg,#f857a6,#ff5858)", name: "بیزینس‌پلاس", desc: "مهارت‌های کسب‌وکار آنلاین و فروش", meta: "۹ دوره · ۶٬۷۰۰ دانشجو" },
  { label: "♪", tag: "هنر", bg: "linear-gradient(135deg,#8a5cff,#d76dff)", name: "هنرکده", desc: "موسیقی، نقاشی و هنرهای دیجیتال", meta: "۲۲ دوره · ۹٬۹۰۰ دانشجو" },
];

const ChevronIcon = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "r" ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
  </svg>
);

export function ExamplesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  return (
    <section id="examples" style={{ margin: "130px 0 0", scrollMarginTop: 100 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 22px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>نمونه آکادمی‌ها</span>
          <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>از هر تخصصی،<br />یک آکادمی واقعی</h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {(["l", "r"] as const).map(dir => (
            <button
              key={dir}
              type="button"
              aria-label={dir === "l" ? "بعدی" : "قبلی"}
              onClick={() => scroll(dir === "l" ? -1 : 1)}
              style={{ display: "grid", placeItems: "center", width: 50, height: 50, borderRadius: 999, border: "1px solid var(--bd)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", boxShadow: "var(--sh-sm)" }}
            >
              <ChevronIcon dir={dir} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{ marginTop: 36, display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", padding: "10px 22px 30px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {academies.map(({ label, tag, bg, name, desc, meta }) => (
          <div
            key={name}
            style={{ scrollSnapAlign: "start", flex: "0 0 360px", borderRadius: "var(--r-lg)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)", overflow: "hidden" }}
          >
            <div style={{ height: 170, background: bg, position: "relative", display: "grid", placeItems: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 40, color: "rgba(255,255,255,.92)" }}>{label}</span>
              <span style={{ position: "absolute", top: 14, right: 14, padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,.22)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 12, fontWeight: 700 }}>{tag}</span>
            </div>
            <div style={{ padding: 22, textAlign: "right" }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{name}</h3>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ink-2)" }}>{desc}</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{meta}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
                  دیدن
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ transform: "scaleX(-1)" }}><path d="m9 6 6 6-6 6"/></svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
