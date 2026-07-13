import Link from "next/link";
import { Suspense } from "react";

import { MarketAlternateLink } from "@/components/seo/market-alternate-link";

const BrandLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="7" r="2.3" fill="#fff" />
    <circle cx="18" cy="6" r="2.3" fill="#fff" opacity=".85" />
    <circle cx="12" cy="17" r="2.6" fill="#fff" />
    <path d="M7.6 8.4 11 15M16.6 7.2 13 15M8 7.3l8-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
  </svg>
);

const socials = [
  { label: "اینستاگرام", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg> },
  { label: "تلگرام", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.1 13l-4.8-1.5c-1-.3-1-1 .2-1.5l18.8-7.2c.9-.3 1.6.2 1.4 1.5z"/></svg> },
  { label: "لینکدین", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z"/></svg> },
];

const cols = [
  { title: "محصول", links: [{ label: "امکانات", href: "#features" }, { label: "قیمت‌ها", href: "#pricing" }, { label: "نمونه آکادمی‌ها", href: "#examples" }, { label: "چطور کار می‌کند", href: "#how" }] },
  { title: "شرکت", links: [{ label: "درباره ما", href: "/about" }, { label: "تماس با ما", href: "/contact" }, { label: "وبلاگ", href: "#" }, { label: "فرصت‌های شغلی", href: "#" }] },
  { title: "قوانین", links: [{ label: "حریم خصوصی", href: "/privacy" }, { label: "قوانین و مقررات", href: "/terms" }, { label: "سیاست بازگشت وجه", href: "/refund" }] },
];

export function HomeFooter() {
  return (
    <footer style={{ margin: "110px 0 0", borderTop: "1px solid var(--bd)", background: "var(--bg-2)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "64px 22px 30px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit" }}>
            <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 12, background: "var(--grad)", flexShrink: 0 }}><BrandLogo /></span>
            <span style={{ fontWeight: 800, fontSize: 21 }}>منتوما</span>
          </a>
          <p style={{ margin: "16px 0 0", fontSize: 14.5, color: "var(--ink-2)", maxWidth: 300, lineHeight: 1.8 }}>
            پلتفرم ساخت آکادمی آنلاین بدون کدنویسی. دانشت را به یک کسب‌وکار آموزشی تبدیل کن.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            {socials.map(({ label, icon }) => (
              <a key={label} href="#" aria-label={label} style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 11, border: "1px solid var(--bd)", background: "var(--card)", color: "var(--ink-2)", transition: "color .2s, border-color .2s" }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {cols.map(col => (
          <div key={col.title}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
              {col.links.map(({ label, href }) => (
                href.startsWith("#") ? (
                  <a key={label} href={href} style={{ textDecoration: "none", color: "var(--ink-2)", transition: "color .2s" }}>{label}</a>
                ) : (
                  <Link key={label} href={href} style={{ textDecoration: "none", color: "var(--ink-2)", transition: "color .2s" }}>{label}</Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: 22, borderTop: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>© ۱۴۰۴ منتوما — همه حقوق محفوظ است.</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Suspense fallback={null}>
            <MarketAlternateLink />
          </Suspense>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>ساخته‌شده با ❤ در ایران</span>
        </div>
      </div>
    </footer>
  );
}
