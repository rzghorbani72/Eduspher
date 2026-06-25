const metrics = [
  { value: "۴٬۸۰۰+", label: "آکادمی ساخته‌شده" },
  { value: "۳۲۰٬۰۰۰+", label: "دانشجوی فعال" },
  { value: "۱۸۰ میلیارد ت", label: "درآمد تولیدشده" },
  { value: "۲۷٬۰۰۰+", label: "دوره منتشرشده" },
];

export function MetricsSection() {
  return (
    <section style={{ maxWidth: 1240, margin: "80px auto 0", padding: "0 22px" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14,
        padding: "40px 26px", borderRadius: "var(--r-xl)",
        border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh)",
      }}>
        {metrics.map(({ value, label }, i) => (
          <div key={label} style={{ textAlign: "center", ...(i > 0 ? { borderRight: "1px solid var(--bd-2)" } : {}) }}>
            <div style={{
              fontWeight: 900, fontSize: "clamp(30px,4vw,46px)",
              background: "var(--grad)", WebkitBackgroundClip: "text",
              backgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "var(--ink-2)", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
