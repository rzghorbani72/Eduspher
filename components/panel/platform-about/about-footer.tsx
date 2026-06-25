import Link from "next/link";

const MentomaLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="7" r="2.3" fill="#fff" />
    <circle cx="18" cy="6" r="2.3" fill="#fff" opacity=".85" />
    <circle cx="12" cy="17" r="2.6" fill="#fff" />
    <path d="M7.6 8.4 11 15M16.6 7.2 13 15M8 7.3l8-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".9" />
  </svg>
);

const footerCols = [
  {
    title: "محصول",
    links: [
      { label: "امکانات", href: "/#features" },
      { label: "قیمت‌ها", href: "/#pricing" },
      { label: "نمونه‌ها", href: "/#examples" },
    ],
  },
  {
    title: "شرکت",
    links: [
      { label: "درباره ما", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
  {
    title: "قوانین",
    links: [
      { label: "حریم خصوصی", href: "/privacy" },
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "بازگشت وجه", href: "/refund" },
    ],
  },
];

export function AboutFooter() {
  return (
    <footer style={{ marginTop: 90, borderTop: "1px solid var(--bd)", background: "var(--bg-2)" }}>
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "54px 22px 30px",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit" }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "var(--grad)",
                flexShrink: 0,
              }}
            >
              <MentomaLogo />
            </span>
            <span style={{ fontWeight: 800, fontSize: 21 }}>منتوما</span>
          </Link>
          <p style={{ margin: "16px 0 0", fontSize: 14.5, color: "var(--ink-2)", maxWidth: 300, lineHeight: 1.8 }}>
            پلتفرم ساخت آکادمی آنلاین بدون کدنویسی.
          </p>
        </div>

        {footerCols.map((col) => (
          <div key={col.title}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className="mt-nav-link" style={{ padding: 0, borderRadius: 0 }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "22px",
          borderTop: "1px solid var(--bd)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>© ۱۴۰۴ منتوما — همه حقوق محفوظ است.</span>
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>ساخته‌شده با ❤ در ایران</span>
      </div>
    </footer>
  );
}
