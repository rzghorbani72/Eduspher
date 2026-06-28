"use client";

import { useState } from "react";
import { AboutHeader } from "../platform-about/about-header";
import { AboutFooter } from "../platform-about/about-footer";

type Theme = "light" | "dark";

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const contactItems = [
  { icon: <EmailIcon />, label: "ایمیل", value: "hello@mentoma.ir" },
  { icon: <PhoneIcon />, label: "تلفن", value: "۰۲۱ - ۹۱۰۰ ۲۲۳۳" },
  { icon: <LocationIcon />, label: "دفتر", value: "تهران، خیابان آزادی" },
];

type FormState = { name: string; email: string; subject: string; message: string };

export function PlatformContactPage({ adminRegisterUrl }: { adminRegisterUrl: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("landing-theme") as Theme | null;
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("landing-theme", next); } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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

      <AboutHeader theme={theme} toggleTheme={toggleTheme} adminRegisterUrl={adminRegisterUrl} activePage="contact" />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 22px" }}>

        <section style={{ padding: "160px 0 30px", textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
            تماس با ما
          </span>
          <h1 style={{ margin: "22px auto 0", maxWidth: 680, fontSize: "clamp(34px,5vw,58px)", fontWeight: 900, lineHeight: 1.18, letterSpacing: "-.015em" }}>
            بیا با هم{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
              حرف بزنیم
            </span>
          </h1>
          <p style={{ margin: "22px auto 0", maxWidth: 560, fontSize: 18, color: "var(--ink-2)", lineHeight: 1.85 }}>
            سوال داری، پیشنهاد همکاری یا فقط می‌خواهی سلام کنی؟ تیم منتوما همیشه آماده‌ی شنیدن است.
          </p>
        </section>

        <section style={{ margin: "24px 0 0", display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 20 }}>

          {submitted ? (
            <div style={{ padding: 32, borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, textAlign: "center" }}>
              <span style={{ display: "grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--grad)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>پیام شما ارسال شد!</h2>
              <p style={{ margin: 0, fontSize: 15, color: "var(--ink-2)", maxWidth: 340 }}>
                ممنون که وقت گذاشتی. معمولاً در کمتر از یک روز کاری پاسخ می‌دهیم.
              </p>
              <button
                type="button"
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                style={{ padding: "11px 24px", borderRadius: 999, border: "1px solid var(--bd)", background: "transparent", color: "var(--ink-2)", fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: 32, borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 7, fontSize: 13.5, fontWeight: 700, color: "var(--ink-2)", textAlign: "right" }}>نام</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="نام شما"
                    style={{ width: "100%", padding: "13px 15px", border: "1px solid var(--bd)", borderRadius: 12, background: "var(--bg-2)", color: "var(--ink)", fontFamily: "inherit", fontSize: 15, outline: "none", textAlign: "right" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 7, fontSize: 13.5, fontWeight: 700, color: "var(--ink-2)", textAlign: "right" }}>ایمیل</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com"
                    style={{ width: "100%", padding: "13px 15px", border: "1px solid var(--bd)", borderRadius: 12, background: "var(--bg-2)", color: "var(--ink)", fontFamily: "inherit", fontSize: 15, outline: "none", textAlign: "right" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", marginBottom: 7, fontSize: 13.5, fontWeight: 700, color: "var(--ink-2)", textAlign: "right" }}>موضوع</label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="درباره‌ی چه چیزی می‌خواهی صحبت کنی؟"
                  style={{ width: "100%", padding: "13px 15px", border: "1px solid var(--bd)", borderRadius: 12, background: "var(--bg-2)", color: "var(--ink)", fontFamily: "inherit", fontSize: 15, outline: "none", textAlign: "right" }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", marginBottom: 7, fontSize: 13.5, fontWeight: 700, color: "var(--ink-2)", textAlign: "right" }}>پیام</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="پیامت را اینجا بنویس..."
                  style={{ width: "100%", padding: "13px 15px", border: "1px solid var(--bd)", borderRadius: 12, background: "var(--bg-2)", color: "var(--ink)", fontFamily: "inherit", fontSize: 15, outline: "none", textAlign: "right", minHeight: 130, resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                className="mt-cta-btn"
                style={{ marginTop: 20, width: "100%", padding: 14, border: "none", borderRadius: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: "#fff", background: "var(--grad)", boxShadow: "0 14px 30px -12px rgba(109,94,252,.7)" }}
              >
                ارسال پیام
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {contactItems.map((item) => (
              <div
                key={item.label}
                style={{ padding: 22, borderRadius: "var(--r-lg)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)", display: "flex", alignItems: "center", gap: 14, textAlign: "right" }}
              >
                <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, background: "var(--grad-soft)", color: "var(--brand)", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{item.value}</div>
                </div>
              </div>
            ))}

            <div style={{ padding: 22, borderRadius: "var(--r-lg)", background: "var(--grad)", color: "#fff", boxShadow: "var(--sh)", textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>پاسخگویی سریع</div>
              <div style={{ marginTop: 6, fontSize: 13.5, opacity: 0.92 }}>معمولاً در کمتر از یک روز کاری پاسخ می‌دهیم.</div>
            </div>
          </div>
        </section>
      </main>

      <AboutFooter />
    </div>
  );
}
