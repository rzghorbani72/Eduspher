const testimonials = [
  { name: "سارا محمدی", role: "مدرس طراحی UI/UX", letter: "س", g: "linear-gradient(135deg,#ffb86b,#ff7a59)", text: "با منتوما در دو هفته آکادمی‌ام را راه انداختم و همان ماه اول به فروش رسیدم. دیگر درگیر هیچ مسئله‌ی فنی نیستم." },
  { name: "امیر کریمی", role: "مدرس برنامه‌نویسی", letter: "ا", g: "linear-gradient(135deg,#6d5efc,#4f8cff)", text: "فقط ضبط می‌کنم و آپلود. مدیریت دانشجو، پرداخت و گزارش‌ها همه خودکار است. تمرکزم فقط روی آموزش است." },
  { name: "نگار رضایی", role: "بنیان‌گذار زبان‌یار", letter: "ن", g: "linear-gradient(135deg,#34e1a3,#15b8c4)", text: "داشبورد درآمد منتوما باعث شد تصمیم‌های فروشم را دقیق‌تر بگیرم. درآمدم در سه ماه سه برابر شد." },
  { name: "حسام موسوی", role: "مدرس بیزینس", letter: "ح", g: "linear-gradient(135deg,#f857a6,#ff5858)", text: "امکان ساخت اشتراک و کد تخفیف، یک درآمد ماهانه‌ی پایدار برایم ساخت. این دقیقاً همان چیزی بود که می‌خواستم." },
  { name: "مریم احمدی", role: "هنرکده", letter: "م", g: "linear-gradient(135deg,#8a5cff,#d76dff)", text: "برند خودم، دامنه‌ی خودم و یک تجربه‌ی حرفه‌ای برای دانشجوها. آکادمی‌ام واقعاً مال خودم است." },
  { name: "پویا صادقی", role: "مدرس بازاریابی", letter: "پ", g: "linear-gradient(135deg,#4f8cff,#34e1a3)", text: "از یک کانال ساده به یک آکادمی واقعی رسیدم. منتوما تمام مسیر را برایم ساده و سریع کرد." },
];

function TestiCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div style={{ flex: "0 0 380px", padding: 26, borderRadius: "var(--r-lg)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)", textAlign: "right" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: "50%", background: t.g, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, flexShrink: 0 }}>{t.letter}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{t.role}</div>
        </div>
      </div>
      <p style={{ margin: "16px 0 0", fontSize: 15, color: "var(--ink-2)", lineHeight: 1.85 }}>{t.text}</p>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section style={{ margin: "130px 0 0" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto 44px", padding: "0 22px", textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>حرف سازنده‌ها</span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>سازنده‌ها عاشق منتوما هستند</h2>
      </div>
      <div style={{ overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)" } as React.CSSProperties}>
        <div className="mtm-marquee-l" style={{ display: "flex", gap: 18, width: "max-content", padding: "6px 9px" }}>
          {/* Doubled for seamless loop */}
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestiCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
