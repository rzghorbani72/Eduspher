import { LP } from "../platform-landing-page.messages";
import { buildAcademyPath } from "@/lib/utils";
import type { StoreSummary } from "@/lib/api/types";

function CodingDemoPreview() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 420 210" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEF3FF" />
          <stop offset="100%" stopColor="#DDE8FF" />
        </linearGradient>
      </defs>
      <rect width="420" height="210" fill="url(#lp-cg)" />
      <rect x="0" y="0" width="420" height="34" fill="#FFFFFF" opacity=".95" />
      <circle cx="15" cy="17" r="5" fill="#FF5F57" />
      <circle cx="29" cy="17" r="5" fill="#FEBC2E" />
      <circle cx="43" cy="17" r="5" fill="#28C840" />
      <rect x="118" y="9" width="184" height="16" rx="4" fill="rgba(0,0,0,.05)" />
      <text x="210" y="21" textAnchor="middle" fill="rgba(0,0,0,.3)" fontSize="9" fontFamily="monospace">kodnevis-.com</text>
      <text x="402" y="60" textAnchor="end" fill="#2A50CC" fontSize="16" fontWeight="bold" fontFamily="sans-serif">کدنویسی نوین</text>
      <rect x="234" y="72" width="130" height="12" rx="3" fill="rgba(42,80,204,.6)" />
      <rect x="254" y="91" width="110" height="9" rx="3" fill="rgba(42,80,204,.35)" />
      <rect x="244" y="108" width="120" height="5" rx="2" fill="rgba(0,0,0,.12)" />
      <rect x="264" y="119" width="100" height="5" rx="2" fill="rgba(0,0,0,.07)" />
      <rect x="254" y="134" width="110" height="24" rx="5" fill="#2A50CC" />
      <text x="309" y="150" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">شروع یادگیری</text>
      <rect x="18" y="42" width="150" height="108" rx="8" fill="#FFFFFF" opacity=".95" />
      <rect x="18" y="42" width="150" height="14" rx="8" fill="#2A50CC" />
      <text x="28" y="68" fill="#2A50CC" fontSize="8.5" fontFamily="monospace">def learn():</text>
      <text x="36" y="81" fill="#1A7A40" fontSize="8.5" fontFamily="monospace">{"  skill += 1"}</text>
      <text x="28" y="94" fill="#CC7A00" fontSize="8.5" fontFamily="monospace">class Python:</text>
      <text x="36" y="107" fill="rgba(0,0,0,.45)" fontSize="8.5" fontFamily="monospace">{"  level = \"آسان\""}</text>
      <text x="28" y="120" fill="rgba(42,80,204,.4)" fontSize="8.5" fontFamily="monospace"># یادگیری آسان</text>
      <text x="28" y="137" fill="rgba(0,0,0,.2)" fontSize="8" fontFamily="monospace">۳ دوره · ۲,۴۰۰ دانشجو</text>
      <rect x="18" y="164" width="85" height="36" rx="5" fill="#FFFFFF" opacity=".9" />
      <rect x="111" y="164" width="85" height="36" rx="5" fill="#FFFFFF" opacity=".9" />
      <rect x="204" y="164" width="85" height="36" rx="5" fill="#FFFFFF" opacity=".9" />
      <rect x="26" y="172" width="68" height="5" rx="2" fill="rgba(42,80,204,.35)" />
      <rect x="26" y="183" width="44" height="4" rx="2" fill="rgba(0,0,0,.1)" />
      <rect x="119" y="172" width="68" height="5" rx="2" fill="rgba(42,80,204,.35)" />
      <rect x="119" y="183" width="44" height="4" rx="2" fill="rgba(0,0,0,.1)" />
      <rect x="212" y="172" width="68" height="5" rx="2" fill="rgba(42,80,204,.35)" />
      <rect x="212" y="183" width="44" height="4" rx="2" fill="rgba(0,0,0,.1)" />
    </svg>
  );
}

function FitnessDemoPreview() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 420 210" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-fg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8ED" />
          <stop offset="100%" stopColor="#FFF0D6" />
        </linearGradient>
        <radialGradient id="lp-fglow" cx="55%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#CC7A00" stopOpacity=".12" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="420" height="210" fill="url(#lp-fg)" />
      <rect width="420" height="210" fill="url(#lp-fglow)" />
      <rect x="0" y="0" width="420" height="34" fill="#FFFFFF" opacity=".9" />
      <circle cx="15" cy="17" r="5" fill="#FF5F57" />
      <circle cx="29" cy="17" r="5" fill="#FEBC2E" />
      <circle cx="43" cy="17" r="5" fill="#28C840" />
      <rect x="118" y="9" width="184" height="16" rx="4" fill="rgba(0,0,0,.05)" />
      <text x="210" y="21" textAnchor="middle" fill="rgba(0,0,0,.3)" fontSize="9" fontFamily="monospace">maktab-fitness.ir</text>
      <text x="402" y="62" textAnchor="end" fill="#CC7A00" fontSize="17" fontWeight="bold" fontFamily="sans-serif">مکتب فیتنس</text>
      <rect x="234" y="74" width="130" height="12" rx="3" fill="rgba(204,122,0,.65)" />
      <rect x="254" y="93" width="110" height="9" rx="3" fill="rgba(204,122,0,.38)" />
      <rect x="244" y="109" width="120" height="5" rx="2" fill="rgba(0,0,0,.1)" />
      <rect x="264" y="120" width="100" height="5" rx="2" fill="rgba(0,0,0,.07)" />
      <rect x="254" y="136" width="110" height="24" rx="5" fill="#CC7A00" />
      <text x="309" y="152" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">ثبت‌نام رایگان</text>
      <ellipse cx="108" cy="72" rx="18" ry="18" fill="rgba(204,122,0,.22)" stroke="rgba(204,122,0,.45)" strokeWidth="2" />
      <ellipse cx="108" cy="108" rx="16" ry="24" fill="rgba(204,122,0,.15)" stroke="rgba(204,122,0,.3)" strokeWidth="1.5" />
      <line x1="96" y1="115" x2="82" y2="140" stroke="rgba(204,122,0,.35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="120" y1="115" x2="134" y2="140" stroke="rgba(204,122,0,.35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="96" y1="132" x2="88" y2="157" stroke="rgba(204,122,0,.3)" strokeWidth="5" strokeLinecap="round" />
      <line x1="120" y1="132" x2="128" y2="157" stroke="rgba(204,122,0,.3)" strokeWidth="5" strokeLinecap="round" />
      <rect x="18" y="166" width="58" height="34" rx="6" fill="#FFFFFF" opacity=".85" />
      <text x="47" y="180" textAnchor="middle" fill="#CC7A00" fontSize="13" fontWeight="bold" fontFamily="sans-serif">۲۸۰</text>
      <text x="47" y="193" textAnchor="middle" fill="rgba(0,0,0,.35)" fontSize="7.5" fontFamily="sans-serif">دوره</text>
      <rect x="84" y="166" width="58" height="34" rx="6" fill="#FFFFFF" opacity=".85" />
      <text x="113" y="180" textAnchor="middle" fill="#CC7A00" fontSize="13" fontWeight="bold" fontFamily="sans-serif">۱۲K</text>
      <text x="113" y="193" textAnchor="middle" fill="rgba(0,0,0,.35)" fontSize="7.5" fontFamily="sans-serif">دانشجو</text>
      <rect x="150" y="166" width="58" height="34" rx="6" fill="#FFFFFF" opacity=".85" />
      <text x="179" y="180" textAnchor="middle" fill="#CC7A00" fontSize="13" fontWeight="bold" fontFamily="sans-serif">۴.۹</text>
      <text x="179" y="193" textAnchor="middle" fill="rgba(0,0,0,.35)" fontSize="7.5" fontFamily="sans-serif">امتیاز</text>
    </svg>
  );
}

function LanguageDemoPreview() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 420 210" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EDFAF8" />
          <stop offset="100%" stopColor="#D8F4F0" />
        </linearGradient>
        <radialGradient id="lp-lglow" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#0D9E8E" stopOpacity=".12" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="420" height="210" fill="url(#lp-lg2)" />
      <rect width="420" height="210" fill="url(#lp-lglow)" />
      <rect x="0" y="0" width="420" height="34" fill="#FFFFFF" opacity=".9" />
      <circle cx="15" cy="17" r="5" fill="#FF5F57" />
      <circle cx="29" cy="17" r="5" fill="#FEBC2E" />
      <circle cx="43" cy="17" r="5" fill="#28C840" />
      <rect x="118" y="9" width="184" height="16" rx="4" fill="rgba(0,0,0,.05)" />
      <text x="210" y="21" textAnchor="middle" fill="rgba(0,0,0,.3)" fontSize="9" fontFamily="monospace">zabankadeh.ir</text>
      <text x="402" y="62" textAnchor="end" fill="#0D9E8E" fontSize="18" fontWeight="bold" fontFamily="sans-serif">زبان‌کده</text>
      <circle cx="50" cy="84" r="20" fill="rgba(13,158,142,.15)" stroke="rgba(13,158,142,.3)" strokeWidth="1.5" />
      <text x="50" y="90" textAnchor="middle" fontSize="18">🇬🇧</text>
      <circle cx="98" cy="72" r="16" fill="rgba(13,158,142,.1)" stroke="rgba(13,158,142,.22)" strokeWidth="1" />
      <text x="98" y="77" textAnchor="middle" fontSize="14">🇩🇪</text>
      <circle cx="140" cy="88" r="13" fill="rgba(13,158,142,.08)" stroke="rgba(13,158,142,.18)" strokeWidth="1" />
      <text x="140" y="93" textAnchor="middle" fontSize="12">🇫🇷</text>
      <rect x="222" y="54" width="162" height="12" rx="3" fill="rgba(13,158,142,.55)" />
      <rect x="242" y="73" width="142" height="9" rx="3" fill="rgba(13,158,142,.32)" />
      <rect x="232" y="89" width="152" height="5" rx="2" fill="rgba(0,0,0,.1)" />
      <rect x="252" y="100" width="132" height="5" rx="2" fill="rgba(0,0,0,.07)" />
      <rect x="252" y="117" width="132" height="24" rx="5" fill="#0D9E8E" />
      <text x="318" y="133" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">یادگیری زبان</text>
      <text x="402" y="158" textAnchor="end" fill="rgba(0,0,0,.3)" fontSize="8" fontFamily="sans-serif">انگلیسی ۶۲٪</text>
      <rect x="18" y="163" width="368" height="7" rx="3" fill="rgba(0,0,0,.07)" />
      <rect x="18" y="163" width="228" height="7" rx="3" fill="rgba(13,158,142,.45)" />
      <text x="402" y="178" textAnchor="end" fill="rgba(0,0,0,.3)" fontSize="8" fontFamily="sans-serif">آلمانی ۴۴٪</text>
      <rect x="18" y="183" width="368" height="7" rx="3" fill="rgba(0,0,0,.07)" />
      <rect x="18" y="183" width="162" height="7" rx="3" fill="rgba(13,158,142,.35)" />
      <text x="402" y="198" textAnchor="end" fill="rgba(0,0,0,.3)" fontSize="8" fontFamily="sans-serif">فرانسوی ۸۰٪</text>
      <rect x="18" y="203" width="368" height="7" rx="3" fill="rgba(0,0,0,.07)" />
      <rect x="18" y="203" width="294" height="7" rx="3" fill="rgba(13,158,142,.4)" />
    </svg>
  );
}

const STATIC_PREVIEWS = [CodingDemoPreview, FitnessDemoPreview, LanguageDemoPreview];

const LIVE_PALETTES = [
  { from: "#EEF3FF", to: "#DDE8FF", accent: "#2A50CC" },
  { from: "#FFF8ED", to: "#FFF0D6", accent: "#CC7A00" },
  { from: "#EDFAF8", to: "#D8F4F0", accent: "#0D9E8E" },
  { from: "#F3EEFF", to: "#E8D8FF", accent: "#7C3AED" },
  { from: "#FFEDF3", to: "#FFD8E8", accent: "#BE185D" },
];

type DemoCardProps = {
  name: string;
  category: string;
  href: string;
  preview: React.ReactNode;
};

function DemoCard({ name, category, href, preview }: DemoCardProps) {
  return (
    <a href={href} className="lp-demo-card" style={{ display: "block", textDecoration: "none" }}>
      <div style={{ height: 210, overflow: "hidden", position: "relative" }}>{preview}</div>
      <div
        className="flex items-center justify-between"
        style={{ padding: "18px 22px", borderTop: "1px solid #E5E3DA" }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.01em", color: "#100F0C" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#A09B8C", marginTop: 3, fontWeight: 500 }}>{category}</div>
        </div>
        <div style={{ color: "#CC7A00", fontSize: 16, fontWeight: 700 }}>←</div>
      </div>
    </a>
  );
}

type Props = {
  academies: StoreSummary[];
};

export function DemosSection({ academies }: Props) {
  const showLive = academies.length > 0;
  const items = showLive ? academies.slice(0, 3) : null;

  return (
    <section id="demos" style={{ padding: "108px 0", background: "#FFFFFF" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}>
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
            {LP.demos.sectionLabel}
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
            {LP.demos.title}
          </h2>
          <p style={{ fontSize: 16, color: "#625E52", lineHeight: 1.85 }}>{LP.demos.sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {showLive && items
            ? items.map((academy, i) => {
                const palette = LIVE_PALETTES[i % LIVE_PALETTES.length];
                const slug = academy.slug ?? String(academy.id);
                const href = buildAcademyPath(slug, "/");
                const domain =
                  academy.domain?.public_address ??
                  academy.domain?.private_address ??
                  slug;
                const preview = (
                  <div
                    className="flex items-center justify-center h-full"
                    style={{
                      background: `linear-gradient(135deg,${palette.from},${palette.to})`,
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="mx-auto mb-3 flex items-center justify-center rounded-2xl"
                        style={{
                          width: 56,
                          height: 56,
                          background: "rgba(255,255,255,.6)",
                          border: `2px solid ${palette.accent}33`,
                        }}
                      >
                        <span style={{ fontSize: 22, fontWeight: 900, color: palette.accent }}>
                          {academy.name.charAt(0)}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: palette.accent }}>{academy.name}</p>
                      <p style={{ fontSize: 11, color: "#625E52", marginTop: 4 }}>{domain}</p>
                    </div>
                  </div>
                );
                return (
                  <DemoCard
                    key={academy.id}
                    name={academy.name}
                    category={domain}
                    href={href}
                    preview={preview}
                  />
                );
              })
            : LP.demos.staticExamples.map((ex, i) => {
                const Preview = STATIC_PREVIEWS[i];
                return (
                  <DemoCard
                    key={ex.name}
                    name={ex.name}
                    category={ex.category}
                    href="#"
                    preview={<Preview />}
                  />
                );
              })}
        </div>
      </div>
    </section>
  );
}
