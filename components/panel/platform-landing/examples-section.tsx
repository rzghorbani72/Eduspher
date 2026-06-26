"use client";

import { useRef, useEffect, useState } from "react";
import type { StoreSummary } from "@/lib/api/types";

const GRADIENTS = [
  "linear-gradient(135deg,#7c6cff,#4f8cff)",
  "linear-gradient(135deg,#34e1a3,#15b8c4)",
  "linear-gradient(135deg,#ffb86b,#ff7a59)",
  "linear-gradient(135deg,#f857a6,#ff5858)",
  "linear-gradient(135deg,#8a5cff,#d76dff)",
  "linear-gradient(135deg,#06b6d4,#0ea5e9)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
];

function gradientFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return GRADIENTS[h % GRADIENTS.length];
}

const ChevronIcon = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "r" ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
  </svg>
);

type Props = {
  academies?: StoreSummary[];
};

export function ExamplesSection({ academies = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const [canScroll, setCanScroll] = useState(false);

  // Track whether the carousel actually overflows the container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => setCanScroll(el.scrollWidth > el.clientWidth);
    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [academies.length]);

  // Auto-swipe when there is overflow
  useEffect(() => {
    if (!canScroll) return;

    const interval = setInterval(() => {
      if (isPaused.current || !scrollRef.current) return;
      const t = scrollRef.current;
      const scrolled = Math.abs(t.scrollLeft);
      const maxScroll = t.scrollWidth - t.clientWidth;

      if (scrolled >= maxScroll - 10) {
        t.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        t.scrollBy({ left: -380, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [canScroll]);

  if (academies.length === 0) return null;

  // In RTL: → (right chevron) = next (scrolls left to reveal later items)
  //         ← (left chevron)  = previous (scrolls right to reveal earlier items)
  const scroll = (dir: "prev" | "next") => {
    scrollRef.current?.scrollBy({ left: dir === "next" ? -380 : 380, behavior: "smooth" });
  };

  return (
    <section id="examples" style={{ margin: "130px 0 0", scrollMarginTop: 100 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 22px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>نمونه آکادمی‌ها</span>
          <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>از هر تخصصی،<br />یک آکادمی واقعی</h2>
        </div>

        {canScroll && (
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              aria-label="قبلی"
              onClick={() => scroll("prev")}
              style={{ display: "grid", placeItems: "center", width: 50, height: 50, borderRadius: 999, border: "1px solid var(--bd)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", boxShadow: "var(--sh-sm)" }}
            >
              <ChevronIcon dir="r" />
            </button>
            <button
              type="button"
              aria-label="بعدی"
              onClick={() => scroll("next")}
              style={{ display: "grid", placeItems: "center", width: 50, height: 50, borderRadius: 999, border: "1px solid var(--bd)", background: "var(--card)", color: "var(--ink)", cursor: "pointer", boxShadow: "var(--sh-sm)" }}
            >
              <ChevronIcon dir="l" />
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 22px" }}>
        <div
          ref={scrollRef}
          onMouseEnter={() => { isPaused.current = true; }}
          onMouseLeave={() => { isPaused.current = false; }}
          style={{ marginTop: 36, display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", padding: "10px 0 30px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {academies.map((academy) => {
            const cover = academy.cover?.publicUrl ?? null;
            const bg = gradientFor(academy.name);
            const initial = academy.name.charAt(0);
            const slug = academy.slug ?? null;

            const card = (
              <div
                style={{ scrollSnapAlign: "start", flex: "0 0 360px", borderRadius: "var(--r-lg)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)", overflow: "hidden", transition: "box-shadow .15s, transform .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--sh)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--sh-sm)"; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
              >
                <div style={{ height: 170, background: cover ? "var(--bg-2)" : bg, backgroundImage: cover ? `url(${cover})` : undefined, backgroundSize: "cover", backgroundPosition: "center", position: "relative", display: "grid", placeItems: "center" }}>
                  {!cover && (
                    <span style={{ fontWeight: 900, fontSize: 52, color: "rgba(255,255,255,.9)", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,.18)" }}>
                      {initial}
                    </span>
                  )}
                  <span style={{ position: "absolute", top: 14, right: 14, padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,.22)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    آکادمی
                  </span>
                </div>
                <div style={{ padding: 22, textAlign: "right" }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{academy.name}</h3>
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
                      دیدن آکادمی
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ transform: "scaleX(-1)" }}><path d="m9 6 6 6-6 6" /></svg>
                    </span>
                  </div>
                </div>
              </div>
            );

            return slug ? (
              <a key={academy.id} href={`/${slug}`} style={{ textDecoration: "none", color: "inherit", display: "block", flex: "0 0 360px" }}>
                {card}
              </a>
            ) : (
              <div key={academy.id} style={{ flex: "0 0 360px" }}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
