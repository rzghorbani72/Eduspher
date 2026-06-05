import { LP } from "../platform-landing-page.messages";

export function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "108px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}>
        {/* Header */}
        <div style={{ marginBottom: 54 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#CC7A00",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            {LP.features.sectionLabel}
          </span>
          <h2
            style={{
              fontSize: "clamp(30px,3.8vw,46px)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginTop: 10,
              marginBottom: 14,
              letterSpacing: "-.02em",
              color: "#100F0C",
            }}
          >
            {LP.features.title}
          </h2>
          <p style={{ fontSize: 16, color: "#625E52", lineHeight: 1.85 }}>{LP.features.sub}</p>
        </div>

        {/* Grid — separated by 1px borders, one rounded container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "#E5E3DA",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 2px 24px rgba(0,0,0,.07)",
          }}
          className="sm:grid-cols-2 lg:grid-cols-3"
        >
          {LP.features.items.map((feat) => (
            <div key={feat.title} className="lp-feat-cell">
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#FEF3E0",
                  border: "1px solid rgba(204,122,0,.2)",
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 18,
                }}
              >
                {feat.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: "-.01em", color: "#100F0C" }}>
                {feat.title}
              </div>
              <p style={{ fontSize: 13, color: "#625E52", lineHeight: 1.8 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
