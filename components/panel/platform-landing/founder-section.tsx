export function FounderSection() {
  return (
    <section style={{ margin: "130px 0 0" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 22px", textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
          داستان ما
        </span>
        <blockquote style={{ margin: "30px 0 0", fontSize: "clamp(24px,3.6vw,40px)", fontWeight: 800, lineHeight: 1.5, letterSpacing: "-.01em" }}>
          «ما خودمان مدرس بودیم و دیدیم ساختن یک آکادمی آنلاین چقدر سخت، گران و فنی است. باور داشتیم که{" "}
          <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            دانش نباید پشت دیوار تکنولوژی بماند
          </span>
          . منتوما را ساختیم تا هر متخصصی، فقط با دانشش، یک کسب‌وکار آموزشی بسازد.»
        </blockquote>
        <div style={{ margin: "34px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#7c6cff,#4f8cff)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 20, flexShrink: 0 }}>م</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>تیم بنیان‌گذار منتوما</div>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)" }}>تهران، ۱۴۰۲</div>
          </div>
        </div>
      </div>
    </section>
  );
}
