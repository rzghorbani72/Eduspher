import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { PoweredBy } from "@/components/shared/powered-by";

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
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
            <BrandLockup />
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
        <PoweredBy className="text-[13px] text-[var(--ink-3)]" />
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>ساخته‌شده با ❤ در ایران</span>
      </div>
    </footer>
  );
}
