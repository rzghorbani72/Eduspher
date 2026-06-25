const brands = ["آکادمی رها", "کدآموز", "زبان‌یار", "دیزاین‌لب", "بیزینس‌پلاس", "هنرکده"];

export function TrustStrip() {
  return (
    <section style={{ maxWidth: 1240, margin: "64px auto 0", padding: "0 22px" }}>
      <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--ink-3)", letterSpacing: ".02em" }}>
        مورد اعتماد سازندگان محتوا و کسب‌وکارهای آموزشی
      </p>
      <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "14px 40px", opacity: 0.72 }}>
        {brands.map(b => (
          <span key={b} style={{ fontWeight: 800, fontSize: 19, color: "var(--ink-2)" }}>{b}</span>
        ))}
      </div>
    </section>
  );
}
