const rows: { label: string; m: string | boolean; l: string | boolean }[] = [
  { label: "سرعت راه‌اندازی", m: "چند دقیقه", l: "هفته‌ها توسعه" },
  { label: "نیاز به برنامه‌نویس", m: false, l: true },
  { label: "فروش و درآمد یکپارچه", m: true, l: false },
  { label: "تجربه کاربری مدرن", m: true, l: false },
  { label: "کنترل دقیق دسترسی‌ها", m: true, l: false },
  { label: "دامنه و برند اختصاصی", m: true, l: "با هزینه اضافه" },
  { label: "هزینه نگهداری", m: "بدون هزینه فنی", l: "بالا" },
];

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);
const CrossIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
);
const GrayCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
);

function CellM({ v }: { v: string | boolean }) {
  if (v === true) return <span style={{ display: "inline-grid", placeItems: "center", width: 30, height: 30, borderRadius: "50%", background: "var(--grad)", boxShadow: "0 6px 14px -6px rgba(109,94,252,.7)" }}><CheckIcon /></span>;
  if (v === false) return <CrossIcon />;
  return <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--brand)" }}>{v}</span>;
}

function CellL({ v }: { v: string | boolean }) {
  if (v === true) return <span style={{ display: "inline-grid", placeItems: "center", width: 30, height: 30, borderRadius: "50%", background: "var(--bg-3)", color: "var(--ink-3)" }}><GrayCheckIcon /></span>;
  if (v === false) return <CrossIcon />;
  return <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink-3)" }}>{v}</span>;
}

export function ComparisonSection() {
  return (
    <section style={{ maxWidth: 1100, margin: "130px auto 0", padding: "0 22px" }}>
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 46px" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>تفاوت منتوما</span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>چرا منتوما، نه LMS سنتی؟</h2>
      </div>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh)", overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr" }}>
          <div style={{ padding: "22px 26px" }} />
          <div style={{ padding: "22px 18px", textAlign: "center", background: "var(--grad)", color: "#fff" }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>منتوما</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>پلتفرم نسل جدید</div>
          </div>
          <div style={{ padding: "22px 18px", textAlign: "center", background: "var(--bg-2)" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "var(--ink-2)" }}>LMS سنتی</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>روش قدیمی</div>
          </div>
        </div>
        {/* Data rows */}
        {rows.map(({ label, m, l }, i) => (
          <div key={label} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", alignItems: "center", borderTop: "1px solid var(--bd-2)" }}>
            <div style={{ padding: "18px 26px", fontWeight: 700, fontSize: 15, textAlign: "right" }}>{label}</div>
            <div style={{ padding: 18, textAlign: "center", background: "var(--brand-soft)" }}><CellM v={m} /></div>
            <div style={{ padding: 18, textAlign: "center" }}><CellL v={l} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
