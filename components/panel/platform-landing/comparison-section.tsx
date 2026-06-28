const oldWayItems = [
  "هفته‌ها طراحی و توسعه‌ی سایت",
  "استخدام و هزینه‌ی برنامه‌نویس",
  "وصله‌کردن چند ابزار پراکنده",
  "دردسر دریافت و تسویه‌ی پول",
  "هزینه‌های فنی و نگهداری پنهان",
  "نمایش برندِ ابزار، نه برند تو",
];

const landingItems = [
  "راه‌اندازی کامل در همان روز",
  "بدون نیاز به کدنویسی یا تیم فنی",
  "سایت، دوره و فروش در یک داشبورد",
  "پرداخت ریالی مستقیم به حساب تو",
  "بدون هزینه‌ی فنی و نگهداری",
  "دامنه و برند کاملاً اختصاصی خودت",
];

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const DashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2 9.6 9.6 2 12l7.6 2.4L12 22l2.4-7.6L22 12l-7.6-2.4z" />
  </svg>
);

export function ComparisonSection() {
  return (
    <section style={{ maxWidth: 1080, margin: "130px auto 0", padding: "0 22px" }}>
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 50px" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
          تفاوت منتوما
        </span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>
          راهِ ساده‌ی ساختن آکادمی
        </h2>
        <p style={{ margin: "18px 0 0", fontSize: 18, color: "var(--ink-2)" }}>
          آنچه قبلاً هفته‌ها وقت، بودجه و تیم فنی می‌خواست، حالا با منتوما در چند کلیک انجام می‌شود.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
        {/* Old Way */}
        <div style={{ padding: "34px 30px", borderRadius: "var(--r-xl)", border: "1px dashed var(--bd)", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <span style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 12, background: "var(--bg-3)", color: "var(--ink-3)" }}>
              <ClockIcon />
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "var(--ink-2)" }}>راهِ قدیمی</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>سخت، گران، زمان‌بر</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {oldWayItems.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ flex: "0 0 auto", display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--bg-3)", color: "var(--ink-3)", marginTop: 1 }}>
                  <DashIcon />
                </span>
                <span style={{ fontSize: 15.5, color: "var(--ink-3)", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Landing Way */}
        <div style={{ position: "relative", padding: "34px 30px", borderRadius: "var(--r-xl)", border: "1px solid var(--brand)", background: "linear-gradient(160deg,var(--brand-soft),var(--card) 70%)", boxShadow: "var(--sh)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <span style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 12, background: "var(--grad)", color: "#fff", boxShadow: "0 10px 22px -8px rgba(109,94,252,.6)" }}>
              <StarIcon />
            </span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>با منتوما</div>
              <div style={{ fontSize: 12.5, color: "var(--brand)" }}>ساده، سریع، یکپارچه</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {landingItems.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ flex: "0 0 auto", width: 10, height: 10, borderRadius: "50%", background: "var(--grad)", marginTop: 7, boxShadow: "0 0 0 4px var(--brand-soft)" }} />
                <span style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
