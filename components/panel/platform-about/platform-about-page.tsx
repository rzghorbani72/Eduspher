"use client";

import { useState } from "react";
import { AboutHeader } from "./about-header";
import { AboutFooter } from "./about-footer";

type Theme = "light" | "dark";

const valueCards = [
  {
    title: "سادگی بی‌رحمانه",
    desc: "پیچیدگی را ما به عهده می‌گیریم تا تو فقط آموزش بدهی.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: "مدرس در مرکز",
    desc: "آکادمی، برند و دانشجوها همیشه متعلق به خودِ توست.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4.5" />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
  {
    title: "رشد واقعی",
    desc: "ابزارهایی که نه فقط برای انتشار، که برای درآمد ساخته شده‌اند.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 2 4-5" />
      </svg>
    ),
  },
];

const stats = [
  { value: "۴٬۸۰۰+", label: "آکادمی فعال" },
  { value: "۳۲۰هزار+", label: "دانشجو" },
  { value: "۱۸۰میلیارد", label: "تومان درآمد سازندگان" },
  { value: "۱۴۰۲", label: "سال تأسیس" },
];

const team = [
  { name: "رها کریمی", role: "هم‌بنیان‌گذار", bg: "linear-gradient(135deg,#7c6cff,#4f8cff)" },
  { name: "آرش موسوی", role: "مدیر محصول", bg: "linear-gradient(135deg,#34e1a3,#15b8c4)" },
  { name: "نگار احمدی", role: "طراح ارشد", bg: "linear-gradient(135deg,#ffb86b,#ff7a59)" },
  { name: "سینا رضایی", role: "مهندس ارشد", bg: "linear-gradient(135deg,#f857a6,#ff5858)" },
];

const storyCards = [
  { bg: "var(--grad)" },
  { bg: "linear-gradient(135deg,#34e1a3,#15b8c4)" },
  { bg: "linear-gradient(135deg,#ffb86b,#ff7a59)" },
];

export function PlatformAboutPage({ adminRegisterUrl }: { adminRegisterUrl: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("landing-theme") as Theme | null;
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("landing-theme", next); } catch {}
  };

  return (
    <div
      className={`landing-page${theme === "dark" ? " theme-dark" : ""}`}
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        overflowX: "clip",
        lineHeight: 1.6,
        fontFamily: "'Vazirmatn', system-ui, sans-serif",
      }}
    >
      {/* Ambient background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-14%", right: "-8%", width: "44vw", height: "44vw", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%,rgba(124,108,255,.26),transparent 62%)", filter: "blur(22px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-12%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%,rgba(79,140,255,.2),transparent 64%)", filter: "blur(24px)" }} />
      </div>

      <AboutHeader theme={theme} toggleTheme={toggleTheme} adminRegisterUrl={adminRegisterUrl} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 22px" }}>

        {/* Hero */}
        <section style={{ padding: "160px 0 30px", textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
            داستان منتوما
          </span>
          <h1 style={{ margin: "22px auto 0", maxWidth: 780, fontSize: "clamp(34px,5vw,60px)", fontWeight: 900, lineHeight: 1.18, letterSpacing: "-.015em" }}>
            ما باور داریم دانش نباید پشت دیوار{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
              تکنولوژی
            </span>{" "}
            بماند
          </h1>
          <p style={{ margin: "24px auto 0", maxWidth: 620, fontSize: 19, color: "var(--ink-2)", lineHeight: 1.85 }}>
            منتوما را ساختیم تا هر متخصصی، فقط با دانشش و بدون دانش فنی، یک کسب‌وکار آموزشی واقعی بسازد.
          </p>
        </section>

        {/* Origin story */}
        <section style={{ margin: "40px 0 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 30, alignItems: "center", padding: 40, borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh)" }}>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-.01em" }}>از یک دردِ آشنا شروع شد</h2>
              <p style={{ margin: "18px 0 0", fontSize: 16.5, color: "var(--ink-2)", lineHeight: 1.95 }}>
                ما خودمان مدرس بودیم. می‌خواستیم دوره‌هایمان را آنلاین بفروشیم، اما هر مسیری یا گران بود، یا کند، یا نیازمند یک تیم فنی. ماه‌ها صرف ساختن چیزی شد که باید چند دقیقه طول می‌کشید.
              </p>
              <p style={{ margin: "14px 0 0", fontSize: 16.5, color: "var(--ink-2)", lineHeight: 1.95 }}>
                پس تصمیم گرفتیم ابزاری بسازیم که خودمان آرزویش را داشتیم: ساده، سریع و کاملاً در اختیار خودِ مدرس. این شد منتوما.
              </p>
            </div>
            <div style={{ alignSelf: "stretch", minHeight: 260, borderRadius: "var(--r-lg)", background: "var(--grad-soft)", border: "1px solid var(--bd-2)", display: "grid", placeItems: "center", overflow: "hidden" }}>
              <div style={{ width: "74%", display: "flex", flexDirection: "column", gap: 12 }}>
                {storyCards.map((card, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, background: "var(--card)", boxShadow: "var(--sh-sm)" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: card.bg, display: "block", flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--bd)" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ margin: "30px 0 0", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {valueCards.map((card) => (
            <div key={card.title} style={{ padding: 30, borderRadius: "var(--r-lg)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)" }}>
              <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 14, background: "var(--grad-soft)", color: "var(--brand)" }}>
                {card.icon}
              </span>
              <h3 style={{ margin: "16px 0 0", fontSize: 19, fontWeight: 800 }}>{card.title}</h3>
              <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "var(--ink-2)" }}>{card.desc}</p>
            </div>
          ))}
        </section>

        {/* Stats */}
        <section style={{ margin: "30px 0 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "38px 26px", borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--grad)", color: "#fff", boxShadow: "var(--sh)" }}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{ textAlign: "center", ...(i > 0 ? { borderRight: "1px solid rgba(255,255,255,.2)" } : {}) }}>
              <div style={{ fontWeight: 900, fontSize: 34 }}>{stat.value}</div>
              <div style={{ marginTop: 6, fontSize: 13.5, opacity: 0.9 }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Team */}
        <section style={{ margin: "64px 0 0", textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-.01em" }}>تیمی کوچک، با ماموریتی بزرگ</h2>
          <p style={{ margin: "14px auto 0", maxWidth: 520, fontSize: 16, color: "var(--ink-2)" }}>
            گروهی از مدرس‌ها، طراح‌ها و مهندس‌ها که آموزش را دوست دارند.
          </p>
          <div style={{ marginTop: 34, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
            {team.map((member) => (
              <div key={member.name} style={{ width: 150 }}>
                <span style={{ display: "block", width: 90, height: 90, borderRadius: "50%", margin: "0 auto", background: member.bg }} />
                <div style={{ marginTop: 12, fontWeight: 800, fontSize: 15 }}>{member.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{member.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ margin: "70px 0 0" }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", padding: "64px 30px", textAlign: "center", background: "var(--grad)", boxShadow: "var(--sh-lg)" }}>
            <h2 style={{ margin: 0, fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-.015em" }}>
              به ماموریت ما بپیوند
            </h2>
            <p style={{ margin: "16px auto 0", maxWidth: 460, fontSize: 17, color: "rgba(255,255,255,.9)" }}>
              همین امروز آکادمی‌ات را رایگان بساز.
            </p>
            <a
              href={adminRegisterUrl}
              className="mt-cta-white"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 28,
                padding: "16px 30px",
                borderRadius: 999,
                textDecoration: "none",
                color: "var(--brand)",
                fontWeight: 800,
                fontSize: 16,
                background: "#fff",
                boxShadow: "0 18px 40px -12px rgba(0,0,0,.35)",
                transition: "transform .2s",
              }}
            >
              شروع رایگان
            </a>
          </div>
        </section>
      </main>

      <AboutFooter />
    </div>
  );
}
