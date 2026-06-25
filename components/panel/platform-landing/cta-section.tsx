type Props = { adminRegisterUrl: string };

export function CtaSection({ adminRegisterUrl }: Props) {
  return (
    <section style={{ maxWidth: 1240, margin: "130px auto 0", padding: "0 22px" }}>
      <div
        className="mtm-grad-pan"
        style={{
          position: "relative", overflow: "hidden",
          borderRadius: "var(--r-xl)",
          padding: "clamp(40px,7vw,90px) 30px",
          textAlign: "center",
          background: "linear-gradient(120deg,#6d5efc,#4f8cff,#7c6cff,#5e97ff)",
          boxShadow: "var(--sh-lg)",
        }}
      >
        {/* Noise overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: .4, backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/%3E%3C/svg%3E')", mixBlendMode: "overlay", pointerEvents: "none" } as React.CSSProperties} />

        <h2 style={{ position: "relative", margin: "0 auto", maxWidth: 680, fontSize: "clamp(32px,5vw,58px)", fontWeight: 900, color: "#fff", letterSpacing: "-.02em", lineHeight: 1.18 }}>
          آکادمی خودت را همین امروز بساز
        </h2>
        <p style={{ position: "relative", margin: "20px auto 0", maxWidth: 520, fontSize: 18, color: "rgba(255,255,255,.88)" }}>
          رایگان شروع کن. بدون کارت بانکی، بدون ریسک. فقط دانش تو و یک داشبورد قدرتمند.
        </p>
        <div style={{ position: "relative", margin: "34px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <a
            href={adminRegisterUrl}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "17px 32px", borderRadius: 999, textDecoration: "none", color: "var(--brand)", fontWeight: 800, fontSize: 17, background: "#fff", boxShadow: "0 18px 40px -12px rgba(0,0,0,.35)" }}
          >
            شروع رایگان
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}><path d="m9 6 6 6-6 6"/></svg>
          </a>
          <a
            href="#examples"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "17px 28px", borderRadius: 999, textDecoration: "none", color: "#fff", fontWeight: 700, fontSize: 17, border: "1.5px solid rgba(255,255,255,.5)" }}
          >
            دیدن نمونه‌ها
          </a>
        </div>
      </div>
    </section>
  );
}
