const cards = [
  {
    span2: true,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8z"/></svg>,
    title: "راه‌اندازی در چند دقیقه",
    desc: "یک قالب آماده انتخاب کن، برندت را اضافه کن و آکادمی‌ات همین حالا آنلاین است. بدون انتظار، بدون توسعه‌دهنده.",
    visual: (
      <div style={{ flex: "0 0 200px", alignSelf: "stretch", borderRadius: 16, background: "var(--bg-2)", border: "1px solid var(--bd-2)", display: "grid", placeItems: "center", minHeight: 150 }}>
        <div style={{ width: "78%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 8, width: "60%", borderRadius: 4, background: "var(--grad)" }} />
          <div style={{ height: 8, width: "90%", borderRadius: 4, background: "var(--bd)" }} />
          <div style={{ height: 8, width: "75%", borderRadius: 4, background: "var(--bd)" }} />
          <div style={{ marginTop: 6, height: 30, borderRadius: 8, background: "var(--grad)", boxShadow: "0 8px 18px -8px rgba(109,94,252,.7)" }} />
        </div>
      </div>
    ),
  },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 9 3 3-3 3M13 15h3"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>, title: "بدون نیاز به کدنویسی", desc: "همه‌چیز با کشیدن و رها کردن. تو روی محتوا تمرکز کن، فنی‌اش با ما." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 3 6v6c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10V6l-9-4z"/><path d="m9 12 2 2 4-4"/></svg>, title: "کنترل کامل دسترسی‌ها", desc: "سطح دسترسی دانشجو، مدرس و مدیر را دقیق تعیین کن. امن و منعطف." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: "فروش و درآمد پایدار", desc: "اشتراک، فروش تکی، کد تخفیف و پرداخت ریالی — همه آماده و یکپارچه." },
  { highlighted: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4.5"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>, title: "برند شخصی آموزشی", desc: "دامنه اختصاصی، رنگ و لوگوی خودت. آکادمی‌ات کاملاً متعلق به توست." },
];

export function FeaturesSection() {
  return (
    <section id="features" style={{ maxWidth: 1240, margin: "120px auto 0", padding: "0 22px", scrollMarginTop: 100 }}>
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
        <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>چرا منتوما</span>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(30px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-.015em", lineHeight: 1.18 }}>برای رشد ساخته شده،<br />نه فقط برای انتشار</h2>
        <p style={{ margin: "18px 0 0", fontSize: 18, color: "var(--ink-2)" }}>هرچیزی که برای راه‌اندازی، فروش و رشد آکادمی‌ات لازم داری — بدون پیچیدگی فنی.</p>
      </div>
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              ...(card.span2 ? { gridColumn: "span 2", display: "flex", gap: 22, alignItems: "center" } : {}),
              padding: 30, borderRadius: "var(--r-lg)",
              border: "1px solid var(--bd)",
              background: card.highlighted ? "linear-gradient(135deg,var(--brand-soft),transparent)" : "var(--card)",
              boxShadow: "var(--sh-sm)", textAlign: "right",
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ display: "grid", placeItems: "center", width: 50, height: 50, borderRadius: 14, background: card.highlighted ? "var(--grad)" : "var(--grad-soft)", color: card.highlighted ? "#fff" : "var(--brand)" }}>
                {card.icon}
              </span>
              <h3 style={{ margin: "18px 0 0", fontSize: card.span2 ? 23 : 21, fontWeight: 800 }}>{card.title}</h3>
              <p style={{ margin: "10px 0 0", fontSize: card.span2 ? 15.5 : 15, color: "var(--ink-2)", maxWidth: card.span2 ? 380 : undefined }}>{card.desc}</p>
            </div>
            {card.visual}
          </div>
        ))}
      </div>
    </section>
  );
}
