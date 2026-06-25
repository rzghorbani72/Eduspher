"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";

const steps = [
  {
    n: "۱", title: "ساخت آکادمی",
    desc: "یک قالب انتخاب کن، نام و لوگو و رنگ برندت را بگذار. آکادمی‌ات روی دامنه اختصاصی، همان لحظه آنلاین می‌شود.",
  },
  {
    n: "۲", title: "آپلود دوره‌ها",
    desc: "ویدیو، متن، فایل و آزمون را با کشیدن و رها کردن اضافه کن. پخش‌کننده‌ی سریع و امن، بدون لو رفتن محتوا.",
  },
  {
    n: "۳", title: "جذب دانشجو",
    desc: "صفحه فروش حرفه‌ای، کد تخفیف و ابزار بازاریابی آماده است. لینک را به اشتراک بگذار و ثبت‌نام‌ها را تماشا کن.",
  },
  {
    n: "۴", title: "شروع درآمد",
    desc: "پرداخت ریالی مستقیم به حساب تو واریز می‌شود. درآمد، تسویه و رشد را لحظه‌ای در داشبورد دنبال کن.",
  },
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) return (
    <div style={{ padding: 20, borderRadius: 18, background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--sh)" }}>
      <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, marginBottom: 10 }}>نام آکادمی</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11, border: "1.5px solid var(--brand)", background: "var(--bg)" }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--grad)", flexShrink: 0 }} />
        <span style={{ fontWeight: 700 }}>آکادمی رها</span>
      </div>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        <div style={{ height: 42, borderRadius: 9, background: "var(--grad)", boxShadow: "0 8px 16px -8px rgba(109,94,252,.7)" }} />
        {[0,1,2].map(i => <div key={i} style={{ height: 42, borderRadius: 9, background: "var(--bg-3)" }} />)}
      </div>
    </div>
  );
  if (index === 1) return (
    <div style={{ padding: 20, borderRadius: 18, background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--sh)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, border: "2px dashed var(--brand)", borderRadius: 14, background: "var(--brand-soft)" }}>
        <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 10, background: "var(--grad)", color: "#fff", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>ویدیو را اینجا رها کن</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>MP4 · تا ۴K</div>
        </div>
      </div>
      {[{ w: "100%", pct: "۱۰۰٪", done: true }, { w: "64%", pct: "۶۴٪", done: false }].map(({ w, pct, done }) => (
        <div key={pct} style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg-3)", display: "grid", placeItems: "center", color: "var(--brand)", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-3)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: w, background: "var(--grad)" }} />
          </div>
          <span style={{ fontSize: 11, color: done ? "#1aa472" : "var(--brand)", fontWeight: 700 }}>{pct}</span>
        </div>
      ))}
    </div>
  );
  if (index === 2) return (
    <div style={{ padding: 20, borderRadius: 18, background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--sh)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>ثبت‌نام‌های امروز</div>
        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "rgba(26,164,114,.14)", color: "#1aa472", fontWeight: 700 }}>زنده</span>
      </div>
      {[
        { l: "سارا محمدی", s: "دوره طراحی UI", c: "#ffb86b", c2: "#ff7a59", price: "۱.۲M ت" },
        { l: "امیر کریمی", s: "پکیج برنامه‌نویسی", c: "#6d5efc", c2: "#4f8cff", price: "۳.۵M ت" },
      ].map(({ l, s, c, c2, price }) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: 9, borderRadius: 11, background: "var(--bg-2)", marginTop: 8 }}>
          <span style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${c},${c2})`, flexShrink: 0 }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 12.5 }}>{l}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{s}</div>
          </div>
          <span style={{ marginRight: "auto", fontWeight: 800, fontSize: 12, color: "#1aa472" }}>{price}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ padding: 22, borderRadius: 18, background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--sh)" }}>
      <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>درآمد کل</div>
      <div style={{ fontWeight: 900, fontSize: 30, marginTop: 4, background: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>۱۸۴٬۵۰۰٬۰۰۰ ت</div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
        {[30, 50, 42, 68, 80, 100].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: i >= 4 ? "var(--grad)" : "var(--bg-3)", borderRadius: "4px 4px 0 0" } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}

export function HowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveStep(Number(e.target.getAttribute("data-step")));
        });
      },
      { threshold: 0.5, rootMargin: "0px 0px -30% 0px" }
    );
    refs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how" style={{ maxWidth: 1240, margin: "130px auto 0", padding: "0 22px", scrollMarginTop: 100 }}>
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 50px" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>مسیر تو با منتوما</span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>از ایده تا اولین درآمد،<br />در چهار قدم</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "start" }}>
        {/* Sticky visual */}
        <div style={{ position: "sticky", top: 110 }}>
          <div style={{ position: "relative", borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-lg)", overflow: "hidden", aspectRatio: "1/1" }}>
            <div style={{ position: "absolute", inset: 0, background: "var(--grad-soft)" }} />
            {steps.map((_, i) => (
              <div key={i} style={{ position: "absolute", inset: 0, padding: 34, display: "flex", flexDirection: "column", justifyContent: "center", opacity: activeStep === i ? 1 : 0, transform: `scale(${activeStep === i ? 1 : 0.96})`, transition: "opacity .4s ease, transform .4s ease", pointerEvents: activeStep === i ? "auto" : "none" }}>
                <div style={{ fontSize: 14, color: "var(--brand)", fontWeight: 800 }}>قدم ۰{i + 1}</div>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 24 }}>{steps[i].title}</div>
                <div style={{ marginTop: 24 }}><StepVisual index={i} /></div>
              </div>
            ))}
          </div>
        </div>
        {/* Steps list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {steps.map((step, i) => (
            <div key={i} data-step={i} ref={el => { refs.current[i] = el; }} style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ padding: 30, borderRadius: "var(--r-lg)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: activeStep === i ? "var(--sh)" : "var(--sh-sm)", opacity: activeStep === i ? 1 : 0.5, transform: activeStep === i ? "none" : "scale(.985)", transition: "opacity .3s, transform .3s, box-shadow .3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, background: "var(--grad)", color: "#fff", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>{step.n}</span>
                  <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{step.title}</h3>
                </div>
                <p style={{ margin: "16px 0 0", fontSize: 16, color: "var(--ink-2)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
