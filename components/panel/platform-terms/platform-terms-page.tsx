"use client";

import { useState } from "react";
import { AboutHeader } from "../platform-about/about-header";
import { AboutFooter } from "../platform-about/about-footer";

type Theme = "light" | "dark";

const sections = [
  {
    title: "۱. پذیرش قوانین",
    body: "با ساخت حساب در منتوما، شما این قوانین را می‌پذیرید. اگر با بخشی از آن موافق نیستید، لطفاً از خدمات استفاده نکنید.",
  },
  {
    title: "۲. حساب کاربری",
    body: "شما مسئول حفظ امنیت حساب و اطلاعات ورود خود هستید. هرگونه فعالیت از طریق حساب شما، مسئولیتش با خودتان است.",
  },
  {
    title: "۳. محتوای شما",
    body: "محتوای دوره‌ها متعلق به خودِ شماست. شما تضمین می‌کنید که حق انتشار آن را دارید و محتوا قوانین کشور را نقض نمی‌کند.",
  },
  {
    title: "۴. پرداخت‌ها و کارمزد",
    body: "منتوما بابت تراکنش‌ها کارمزد مشخصی دریافت می‌کند که در صفحه‌ی قیمت‌گذاری اعلام شده است. باقی درآمد به حساب شما واریز می‌شود.",
  },
  {
    title: "۵. رفتار مجاز",
    body: "استفاده از منتوما برای انتشار محتوای غیرقانونی، کلاهبرداری یا نقض حقوق دیگران ممنوع است و منجر به مسدودسازی حساب می‌شود.",
  },
  {
    title: "۶. تغییر قوانین",
    body: "ممکن است این قوانین را به‌روزرسانی کنیم. تغییرات مهم را از پیش به شما اطلاع می‌دهیم.",
  },
];

export function PlatformTermsPage({ adminRegisterUrl }: { adminRegisterUrl: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("mentoma-theme") as Theme | null;
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("mentoma-theme", next); } catch {}
  };

  return (
    <div
      className={`mentoma-page${theme === "dark" ? " theme-dark" : ""}`}
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
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-14%", right: "-8%", width: "44vw", height: "44vw", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%,rgba(124,108,255,.26),transparent 62%)", filter: "blur(22px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-12%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%,rgba(79,140,255,.2),transparent 64%)", filter: "blur(24px)" }} />
      </div>

      <AboutHeader theme={theme} toggleTheme={toggleTheme} adminRegisterUrl={adminRegisterUrl} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "0 22px" }}>
        <section style={{ padding: "150px 0 8px", textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
            قوانین و مقررات
          </span>
          <h1 style={{ margin: "20px auto 0", fontSize: "clamp(32px,4.6vw,52px)", fontWeight: 900, lineHeight: 1.18, letterSpacing: "-.015em" }}>
            قوانین و مقررات
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 14, color: "var(--ink-3)" }}>
            آخرین به‌روزرسانی: خرداد ۱۴۰۴
          </p>
        </section>

        <article
          style={{
            marginTop: 30,
            padding: 40,
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--bd)",
            background: "var(--card)",
            boxShadow: "var(--sh)",
            textAlign: "right",
          }}
        >
          {sections.map((section, i) => (
            <div key={section.title} style={{ marginTop: i === 0 ? 0 : 30 }}>
              <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-.01em" }}>
                {section.title}
              </h2>
              <p style={{ margin: "12px 0 0", fontSize: 15.5, color: "var(--ink-2)", lineHeight: 1.95 }}>
                {section.body}
              </p>
            </div>
          ))}
        </article>
      </main>

      <AboutFooter />
    </div>
  );
}
