"use client";

import Link from "next/link";

type Theme = "light" | "dark";

const MentomaLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="7" r="2.3" fill="#fff" />
    <circle cx="18" cy="6" r="2.3" fill="#fff" opacity=".85" />
    <circle cx="12" cy="17" r="2.6" fill="#fff" />
    <path d="M7.6 8.4 11 15M16.6 7.2 13 15M8 7.3l8-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
  </svg>
);

type Props = {
  theme: Theme;
  toggleTheme: () => void;
  adminLoginUrl: string;
  adminRegisterUrl: string;
};

export function HomeHeader({ theme, toggleTheme, adminLoginUrl, adminRegisterUrl }: Props) {
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, transition: "padding .35s ease" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 22px" }}>
        <nav
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18,
            padding: "10px 14px 10px 12px",
            border: "1px solid var(--bd)", borderRadius: 999,
            background: "var(--header-bg)",
            backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)",
            boxShadow: "var(--sh-sm)", transition: "box-shadow .35s ease, border-color .35s ease",
          }}
        >
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit" }}>
            <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 12, background: "var(--grad)", boxShadow: "0 8px 20px -6px rgba(109,94,252,.6)", flexShrink: 0 }}>
              <MentomaLogo />
            </span>
            <span style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-.01em" }}>منتوما</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[
              { href: "#features", label: "امکانات" },
              { href: "#how", label: "چطور کار می‌کند" },
              { href: "#examples", label: "نمونه‌ها" },
              { href: "#pricing", label: "قیمت‌ها" },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="mt-nav-link">{label}</a>
            ))}
            <Link href="/about" className="mt-nav-link">درباره ما</Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="تغییر تم"
              className="mt-theme-btn"
              style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, border: "1px solid var(--bd)", background: "var(--card)", color: "var(--ink-2)", cursor: "pointer", transition: "color .2s, border-color .2s" }}
            >
              {theme === "dark" ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" /></svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" /></svg>
              )}
            </button>
            <a href={adminLoginUrl} style={{ padding: "10px 16px", borderRadius: 999, textDecoration: "none", color: "var(--ink-2)", fontWeight: 600, fontSize: 15 }}>ورود</a>
            <a
              href={adminRegisterUrl}
              className="mt-cta-btn"
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 19px", borderRadius: 999, textDecoration: "none", color: "var(--brand-ink)", fontWeight: 700, fontSize: 15, background: "var(--grad)", boxShadow: "0 12px 26px -10px rgba(109,94,252,.7)", transition: "transform .2s, box-shadow .2s" }}
            >
              ساخت آکادمی رایگان
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
