import type { CSSProperties } from "react";

const barHeights = ["42%", "58%", "50%", "72%", "64%", "88%", "76%", "100%"];

type Props = { adminRegisterUrl: string };

export function HeroSection({ adminRegisterUrl }: Props) {
  return (
    <section style={{ maxWidth: 1240, margin: "0 auto", padding: "150px 22px 40px", textAlign: "center" }}>
      {/* Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 8px 7px 16px", borderRadius: 999, border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-sm)", fontSize: 13.5, fontWeight: 600, color: "var(--ink-2)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 999, background: "var(--grad-soft)", color: "var(--brand)", fontWeight: 700 }}>جدید</span>
        ساخت آکادمی با هوش مصنوعی، حالا در منتوما
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}><path d="m9 6 6 6-6 6" /></svg>
      </div>

      <h1 style={{ margin: "26px auto 0", maxWidth: 820, fontSize: "clamp(36px,5.6vw,68px)", lineHeight: 1.18, fontWeight: 900, letterSpacing: "-.015em" }}>
        آکادمی آنلاین خودت را{" "}
        <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>بدون دانش فنی</span>{" "}
        بساز
      </h1>

      <p style={{ margin: "30px auto 0", maxWidth: 640, fontSize: "clamp(16px,2.1vw,20px)", color: "var(--ink-2)", lineHeight: 1.85 }}>
        منتوما کمکت می‌کند آکادمی شخصی‌ات را بسازی، دوره بفروشی، دانشجو مدیریت کنی و کسب‌وکار آموزشی‌ات را رشد بدهی — همه از یک داشبورد ساده و قدرتمند.
      </p>

      <div style={{ margin: "36px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <a href={adminRegisterUrl} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "16px 28px", borderRadius: 999, textDecoration: "none", color: "var(--brand-ink)", fontWeight: 700, fontSize: 17, background: "var(--grad)", boxShadow: "0 18px 40px -14px rgba(109,94,252,.8)" }}>
          ساخت آکادمی رایگان
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}><path d="m9 6 6 6-6 6" /></svg>
        </a>
        <a href="#examples" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "16px 26px", borderRadius: 999, textDecoration: "none", color: "var(--ink)", fontWeight: 700, fontSize: 17, background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--sh-sm)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          مشاهده نمونه آکادمی‌ها
        </a>
      </div>
      <p style={{ margin: "18px 0 0", fontSize: 13.5, color: "var(--ink-3)" }}>بدون نیاز به کارت بانکی · راه‌اندازی در کمتر از ۵ دقیقه</p>

      {/* Social proof */}
      <div style={{ margin: "30px 0 0", display: "inline-flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {([ ["س","#ffb86b","#ff7a59"], ["ا","#6d5efc","#4f8cff"], ["ن","#34e1a3","#15b8c4"], ["م","#f857a6","#ff5858"] ] as [string,string,string][]).map(([l,c1,c2],i) => (
            <span key={i} style={{ width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${c1},${c2})`,border:"2px solid var(--bg)",display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontSize:14,...(i>0?{marginRight:-12}:{}) } as CSSProperties}>{l}</span>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", gap: 2, color: "#ffb020" }}>
            {[0,1,2,3,4].map(i => (
              <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>
            ))}
          </div>
          <div style={{ marginTop: 3, fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>امتیاز ۵.۰ — مورد اعتماد ۱۰٬۸۰۰+ سازنده</div>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div style={{ position: "relative", margin: "70px auto 0", maxWidth: 1080 }}>
        <div style={{ position: "absolute", inset: "-6% -4%", background: "var(--grad-soft)", filter: "blur(50px)", borderRadius: "50%", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, borderRadius: "var(--r-xl)", border: "1px solid var(--bd)", background: "var(--card)", boxShadow: "var(--sh-lg)", overflow: "hidden" }}>
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--bd-2)", background: "var(--card-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {["#ff5f57","#febc2e","#28c840"].map(c => <span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c }}/>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-3)", fontSize: 12.5, fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              academy.mentoma.ir
            </div>
            <div style={{ width: 60 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 440 }}>
            {/* Sidebar */}
            <aside style={{ borderLeft: "1px solid var(--bd-2)", background: "var(--card-2)", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 6px 16px" }}>
                <span style={{ width:30,height:30,borderRadius:9,background:"var(--grad)" }}/>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight:800,fontSize:14 }}>آکادمی رها</div>
                  <div style={{ fontSize:11,color:"var(--ink-3)" }}>پلن پرو</div>
                </div>
              </div>
              {[
                { label:"داشبورد",active:true,icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg> },
                { label:"دوره‌ها",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/></svg> },
                { label:"دانشجوها",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M17 11a3 3 0 1 0-2-5.2M16 20a5 5 0 0 0-3-4.6"/></svg> },
                { label:"تحلیل و درآمد",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 4-5"/></svg> },
              ].map(({label,active,icon}) => (
                <div key={label} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,background:active?"var(--brand-soft)":"transparent",color:active?"var(--brand)":"var(--ink-2)",fontWeight:active?700:600,fontSize:13.5 }}>{icon}{label}</div>
              ))}
            </aside>
            {/* Content */}
            <div style={{ padding: 20, background: "var(--bg)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:800,fontSize:17 }}>سلام رها 👋</div>
                  <div style={{ fontSize:12.5,color:"var(--ink-3)" }}>گزارش امروز آکادمی شما</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:"var(--grad)",color:"#fff",fontWeight:700,fontSize:12.5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>دوره جدید
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14 }}>
                {[
                  {label:"درآمد این ماه",val:"۱۸۴٬۵۰۰",unit:" هزار ت",badge:"↑ ۲۳٪ نسبت به ماه قبل",bc:"#1aa472"},
                  {label:"دانشجوی فعال",val:"۲٬۴۸۹",badge:"↑ ۱۴۲ نفر این هفته",bc:"#1aa472"},
                  {label:"نرخ تکمیل دوره",val:"۷۸٪",badge:"بالاتر از میانگین",bc:"var(--brand)"},
                ].map(({label,val,unit,badge,bc}) => (
                  <div key={label} style={{ padding:14,borderRadius:14,border:"1px solid var(--bd-2)",background:"var(--card)",boxShadow:"var(--sh-sm)" }}>
                    <div style={{ fontSize:11.5,color:"var(--ink-3)",fontWeight:600 }}>{label}</div>
                    <div style={{ fontWeight:900,fontSize:21,marginTop:4 }}>{val}{unit&&<span style={{fontSize:11,color:"var(--ink-3)",fontWeight:600}}>{unit}</span>}</div>
                    <div style={{ fontSize:11,color:bc,fontWeight:700,marginTop:3 }}>{badge}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:16,borderRadius:14,border:"1px solid var(--bd-2)",background:"var(--card)",boxShadow:"var(--sh-sm)" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                  <div style={{ fontWeight:700,fontSize:13.5 }}>روند فروش دوره‌ها</div>
                  <div style={{ fontSize:11,color:"var(--ink-3)",fontWeight:600 }}>۳۰ روز اخیر</div>
                </div>
                <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:108 }}>
                  {barHeights.map((h,i) => (
                    <div key={i} className="mtm-bar-grow" style={{ flex:1,height:h,background:i===5||i===7?"var(--grad)":"var(--bg-3)",borderRadius:"6px 6px 0 0",animationDelay:`${i*55}ms` } as CSSProperties}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Floating sale card */}
        <div className="mtm-float-a" style={{ position:"absolute",zIndex:3,top:"16%",left:"-3%",display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:16,background:"var(--card)",border:"1px solid var(--bd)",boxShadow:"var(--sh)" }}>
          <span style={{ display:"grid",placeItems:"center",width:36,height:36,borderRadius:10,background:"rgba(26,164,114,.14)",color:"#1aa472" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800,fontSize:13 }}>فروش جدید!</div>
            <div style={{ fontSize:11,color:"var(--ink-3)" }}>دوره «ری‌اکت پیشرفته»</div>
          </div>
        </div>
        {/* Floating students card */}
        <div className="mtm-float-b" style={{ position:"absolute",zIndex:3,bottom:"14%",right:"-4%",display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:16,background:"var(--card)",border:"1px solid var(--bd)",boxShadow:"var(--sh)" }}>
          <div style={{ display:"flex",marginLeft:2 }}>
            {([ ["#ffb86b","#ff7a59"], ["#6d5efc","#4f8cff"], ["#34e1a3","#15b8c4"] ] as [string,string][]).map(([c1,c2],i) => (
              <span key={i} style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${c1},${c2})`,border:"2px solid var(--card)",...(i>0?{marginRight:-9}:{}) } as CSSProperties}/>
            ))}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:800,fontSize:13 }}>۱۲ دانشجوی جدید</div>
            <div style={{ fontSize:11,color:"var(--ink-3)" }}>در یک ساعت گذشته</div>
          </div>
        </div>
      </div>
    </section>
  );
}
