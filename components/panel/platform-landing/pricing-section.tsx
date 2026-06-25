"use client";

import { useState } from "react";

type Billing = "monthly" | "yearly";

const plans = [
  {
    id: "starter",
    name: "استارتر",
    desc: "برای شروع و تست ایده",
    priceM: "رایگان",
    priceY: "رایگان",
    note: "برای همیشه",
    cta: "شروع رایگان",
    featured: false,
    features: ["۱ آکادمی", "تا ۳ دوره", "تا ۵۰ دانشجو", "پشتیبانی انجمن"],
  },
  {
    id: "pro",
    name: "پرو",
    desc: "برای سازندگان جدی محتوا",
    priceM: "۳۲۵,۰۰۰",
    priceY: "۲۷۰,۰۰۰",
    note: null,
    cta: "شروع آزمایش رایگان",
    featured: true,
    features: ["۳ آکادمی", "دوره نامحدود", "دانشجوی نامحدود", "دامنه اختصاصی + حذف برند منتوما", "درگاه پرداخت و کد تخفیف", "پشتیبانی اولویت‌دار"],
  },
  {
    id: "business",
    name: "بیزینس",
    desc: "برای تیم‌ها و سازمان‌ها",
    priceM: "۸۲۵,۰۰۰",
    priceY: "۶۸۰,۰۰۰",
    note: null,
    cta: "تماس با فروش",
    featured: false,
    features: ["آکادمی نامحدود", "مدیریت تیم و مدرسان", "سطح دسترسی پیشرفته", "گزارش و API اختصاصی", "مدیر موفقیت اختصاصی"],
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const yearly = billing === "yearly";

  return (
    <section id="pricing" style={{ maxWidth: 1180, margin: "130px auto 0", padding: "0 22px", scrollMarginTop: 100 }}>
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>قیمت‌گذاری</span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>یک پلن برای هر مرحله از رشد</h2>
        <p style={{ margin: "18px 0 0", fontSize: 18, color: "var(--ink-2)" }}>رایگان شروع کن، هر وقت رشد کردی ارتقا بده.</p>
        {/* Billing toggle */}
        <div style={{ margin: "30px auto 0", display: "inline-flex", alignItems: "center", gap: 6, padding: 5, borderRadius: 999, border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)", position: "relative" }}>
          <span style={{ position: "absolute", top: 5, bottom: 5, width: "calc(50% - 5px)", borderRadius: 999, background: "var(--grad)", transition: "transform .35s cubic-bezier(.16,1,.3,1)", right: 5, transform: yearly ? "translateX(0)" : "translateX(-100%)" }} />
          {(["yearly", "monthly"] as Billing[]).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              style={{ position: "relative", zIndex: 1, padding: "9px 22px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14.5, color: billing === b ? "#fff" : "var(--ink-2)", transition: "color .3s", display: "flex", alignItems: "center", gap: 7 }}
            >
              {b === "yearly" ? (
                <>سالانه<span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(26,164,114,.16)", color: "#1aa472", fontSize: 11, fontWeight: 800 }}>۲ ماه هدیه</span></>
              ) : "ماهانه"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 46, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, alignItems: "stretch" }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            style={{
              display: "flex", flexDirection: "column", padding: plan.featured ? "34px 32px" : 32,
              borderRadius: "var(--r-lg)",
              border: plan.featured ? "1.5px solid transparent" : "1px solid var(--bd)",
              background: plan.featured
                ? "linear-gradient(var(--card),var(--card)) padding-box, var(--grad) border-box"
                : "var(--card)",
              boxShadow: plan.featured ? "var(--sh-lg)" : "var(--sh-sm)",
              transform: plan.featured ? "scale(1.03)" : "none",
              position: "relative",
            }}
          >
            {plan.featured && (
              <span style={{ position: "absolute", top: 18, left: 24, padding: "5px 13px", borderRadius: 999, background: "var(--grad)", color: "#fff", fontSize: 12, fontWeight: 800, boxShadow: "0 8px 18px -8px rgba(109,94,252,.7)" }}>محبوب‌ترین</span>
            )}
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{plan.name}</h3>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ink-2)" }}>{plan.desc}</p>
            <div style={{ margin: "22px 0 0", display: "flex", alignItems: "flex-end", gap: 7 }}>
              <span style={{ fontWeight: 900, fontSize: 40, lineHeight: 1 }}>
                {plan.priceM === "رایگان" ? "رایگان" : yearly ? plan.priceY : plan.priceM}
              </span>
              {plan.priceM !== "رایگان" && (
                <span style={{ fontSize: 14, color: "var(--ink-3)", fontWeight: 600, paddingBottom: 6 }}>تومان / ماه</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6, minHeight: 18 }}>
              {plan.note ?? (yearly ? "پرداخت سالانه — ۲ ماه رایگان" : "")}
            </div>
            <a
              href="#"
              style={{
                margin: "24px 0 0", textAlign: "center", padding: 13, borderRadius: 13, textDecoration: "none",
                fontWeight: 700,
                color: plan.featured ? "#fff" : "var(--ink)",
                background: plan.featured ? "var(--grad)" : "var(--bg-2)",
                border: plan.featured ? "none" : "1px solid var(--bd)",
                boxShadow: plan.featured ? "0 14px 30px -12px rgba(109,94,252,.8)" : "none",
              }}
            >
              {plan.cta}
            </a>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 13, fontSize: 14.5, color: plan.featured ? "var(--ink)" : "var(--ink-2)" }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--brand)" }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
