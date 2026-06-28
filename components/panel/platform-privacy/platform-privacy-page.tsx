"use client";

import { useState } from "react";
import { AboutHeader } from "../platform-about/about-header";
import { AboutFooter } from "../platform-about/about-footer";

type Theme = "light" | "dark";

const sections = [
  {
    title: "۱. چه اطلاعاتی جمع‌آوری می‌کنیم",
    body: "برای ارائه‌ی خدمات منتوما، اطلاعاتی مثل نام، ایمیل، شماره تماس و اطلاعات آکادمی شما را جمع‌آوری می‌کنیم. همچنین داده‌های استفاده مثل دوره‌های منتشرشده و فعالیت دانشجوها برای بهبود تجربه‌ی شما ثبت می‌شود.",
  },
  {
    title: "۲. چطور از اطلاعات استفاده می‌کنیم",
    body: "اطلاعات شما فقط برای راه‌اندازی آکادمی، پردازش پرداخت‌ها، پشتیبانی و بهبود محصول استفاده می‌شود. ما هرگز اطلاعات شما را بدون اجازه به اشخاص ثالث نمی‌فروشیم.",
  },
  {
    title: "۳. امنیت داده‌ها",
    body: "تمام داده‌ها روی سرورهای امن و رمزنگاری‌شده نگهداری می‌شوند. دسترسی به اطلاعات حساس محدود و کنترل‌شده است.",
  },
  {
    title: "۴. کوکی‌ها",
    body: "از کوکی‌ها برای حفظ ورود شما و تحلیل عملکرد سایت استفاده می‌کنیم. می‌توانید از طریق تنظیمات مرورگر کوکی‌ها را مدیریت کنید.",
  },
  {
    title: "۵. حقوق شما",
    body: "شما در هر زمان می‌توانید اطلاعات خود را مشاهده، ویرایش یا حذف کنید. برای حذف کامل حساب کافی است با ما تماس بگیرید.",
  },
  {
    title: "۶. تماس با ما",
    body: "اگر درباره‌ی حریم خصوصی سوالی دارید، از طریق ایمیل hello@mentoma.ir با ما در ارتباط باشید.",
  },
];

export function PlatformPrivacyPage({ adminRegisterUrl }: { adminRegisterUrl: string }) {
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
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-14%", right: "-8%", width: "44vw", height: "44vw", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%,rgba(124,108,255,.26),transparent 62%)", filter: "blur(22px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-12%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%,rgba(79,140,255,.2),transparent 64%)", filter: "blur(24px)" }} />
      </div>

      <AboutHeader theme={theme} toggleTheme={toggleTheme} adminRegisterUrl={adminRegisterUrl} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "0 22px" }}>
        <section style={{ padding: "150px 0 8px", textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
            حریم خصوصی
          </span>
          <h1 style={{ margin: "20px auto 0", fontSize: "clamp(32px,4.6vw,52px)", fontWeight: 900, lineHeight: 1.18, letterSpacing: "-.015em" }}>
            سیاست حریم خصوصی
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
