import { LP } from "../platform-landing-page.messages";

type PricingCardProps = {
  plan: (typeof LP.pricing.plans)[number];
  ctaHref: string;
};

function PricingCard({ plan, ctaHref }: PricingCardProps) {
  const hot = plan.highlighted;

  return (
    <div
      className="lp-plan relative"
      style={{
        background: hot ? "#0B1133" : "#FFFFFF",
        border: `1px solid ${hot ? "#0B1133" : "#E5E3DA"}`,
        borderRadius: 20,
        padding: "34px 28px",
        boxShadow: hot
          ? "0 8px 48px rgba(11,17,51,.28), 0 0 0 1px rgba(255,255,255,.04) inset"
          : "0 2px 16px rgba(0,0,0,.06)",
      }}
    >
      {plan.badge && (
        <span
          style={{
            position: "absolute",
            top: -14,
            right: "50%",
            transform: "translateX(50%)",
            background: "#CC7A00",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "5px 18px",
            borderRadius: 100,
            whiteSpace: "nowrap",
            letterSpacing: ".03em",
          }}
        >
          {plan.badge}
        </span>
      )}

      <p style={{ fontSize: 13, fontWeight: 600, color: hot ? "rgba(255,255,255,.5)" : "#625E52", marginBottom: 8 }}>
        {plan.name}
      </p>

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, letterSpacing: "-.03em", color: hot ? "#FAFAF8" : "#100F0C" }}>
          {plan.price}
        </span>
        {plan.priceSuffix && (
          <small style={{ fontSize: 14, fontWeight: 400, opacity: 0.55, color: hot ? "#FAFAF8" : "#100F0C" }}>
            {plan.priceSuffix}
          </small>
        )}
      </div>

      <p style={{ fontSize: 12, color: hot ? "rgba(255,255,255,.5)" : "#A09B8C", marginBottom: 26, fontWeight: 500 }}>
        {plan.period}
      </p>

      <div style={{ height: 1, background: hot ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.07)", marginBottom: 22 }} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
        {plan.features.map((f) => (
          <li
            key={f.text}
            className="flex items-center gap-[9px]"
            style={{ fontSize: 13, color: f.enabled ? (hot ? "#FAFAF8" : "#625E52") : hot ? "rgba(255,255,255,.3)" : "#A09B8C" }}
          >
            <span style={{ color: f.enabled ? "#CC7A00" : hot ? "rgba(255,255,255,.2)" : "#E5E3DA", fontWeight: 700, flexShrink: 0 }}>
              {f.enabled ? "✓" : "—"}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        className={hot ? "lp-btn-white" : "lp-btn-outline"}
      >
        {plan.cta}
      </a>
    </div>
  );
}

type Props = {
  adminRegisterUrl: string;
  adminLoginUrl: string;
};

export function PricingSection({ adminRegisterUrl, adminLoginUrl }: Props) {
  const ctaUrls = [adminRegisterUrl, adminRegisterUrl, `${adminLoginUrl}?plan=custom`];

  return (
    <section id="pricing" style={{ padding: "108px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}>
        <div style={{ marginBottom: 54, textAlign: "center" }}>
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
            {LP.pricing.sectionLabel}
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
            {LP.pricing.title}
          </h2>
          <p style={{ fontSize: 16, color: "#625E52", lineHeight: 1.85, maxWidth: 480, margin: "0 auto" }}>
            {LP.pricing.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[22px] items-start">
          {LP.pricing.plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} ctaHref={ctaUrls[i]!} />
          ))}
        </div>
      </div>
    </section>
  );
}
