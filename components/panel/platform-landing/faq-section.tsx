"use client";

import { useState } from "react";

const faqs = [
  { q: "منتوما دقیقاً چیست؟", a: "منتوما یک پلتفرم ساخت آکادمی آنلاین بدون کدنویسی است؛ از ساخت سایت و آپلود دوره تا فروش و مدیریت دانشجو، همه در یک داشبورد ساده." },
  { q: "برای استفاده به دانش فنی نیاز دارم؟", a: "نه. همه‌چیز با کشیدن و رها کردن انجام می‌شود و هیچ نیازی به برنامه‌نویس نداری." },
  { q: "چطور پول دوره‌هایم را دریافت می‌کنم؟", a: "با اتصال درگاه پرداخت ریالی، مبلغ فروش مستقیم و بدون واسطه به حساب خودت واریز می‌شود." },
  { q: "می‌توانم دامنه و برند اختصاصی داشته باشم؟", a: "بله؛ در پلن پرو و بالاتر دامنه اختصاصی، لوگو و رنگ برند خودت را داری و نام منتوما حذف می‌شود." },
  { q: "محتوای دوره‌هایم امن است؟", a: "بله. پخش‌کننده‌ی امن منتوما از دانلود غیرمجاز و اشتراک‌گذاری محتوا جلوگیری می‌کند." },
  { q: "می‌توانم رایگان شروع کنم؟", a: "بله، پلن استارتر برای همیشه رایگان است و بدون نیاز به کارت بانکی شروع می‌کنی." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section style={{ maxWidth: 840, margin: "130px auto 0", padding: "0 22px" }}>
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>سوال‌های پرتکرار</span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>هرچه باید بدانی</h2>
      </div>

      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh)", padding: "6px 28px" }}>
        {faqs.map(({ q, a }, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid var(--bd-2)" : "none" }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "22px 4px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "right", color: "var(--ink)" }}
              >
                <span style={{ fontWeight: 700, fontSize: 17 }}>{q}</span>
                <span
                  style={{
                    flexShrink: 0, display: "grid", placeItems: "center", width: 30, height: 30,
                    borderRadius: "50%",
                    background: isOpen ? "var(--grad)" : "var(--brand-soft)",
                    color: isOpen ? "#fff" : "var(--brand)",
                    transition: "transform .35s ease, background .3s, color .3s",
                    transform: isOpen ? "rotate(45deg)" : "none",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </span>
              </button>
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: isOpen ? 200 : 0,
                  opacity: isOpen ? 1 : 0,
                  transition: "max-height .4s ease, opacity .4s ease",
                }}
              >
                <p style={{ margin: "0 0 22px", padding: "0 4px", fontSize: 15.5, color: "var(--ink-2)", lineHeight: 1.9, maxWidth: 660 }}>{a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
