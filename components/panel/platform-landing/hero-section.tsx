import { LP } from "../platform-landing-page.messages";
import type { StoreSummary } from "@/lib/api/types";

function BrowserMockup() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E3DA",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow:
          "0 4px 6px rgba(0,0,0,.04), 0 20px 60px rgba(0,0,0,.1), 0 0 0 1px rgba(255,255,255,.7) inset",
        transform: "perspective(1100px) rotateY(4deg) rotateX(2deg)",
        transition: "transform .5s ease",
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-3 px-4 py-[11px]"
        style={{
          background: "#F2F1EC",
          borderBottom: "1px solid #E5E3DA",
          direction: "ltr",
        }}
      >
        <div className="flex gap-[5px]">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FF5F57",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FEBC2E",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#28C840",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            background: "#F8F7F2",
            border: "1px solid #E5E3DA",
            borderRadius: 5,
            padding: "5px 12px",
            fontSize: 11,
            color: "#A09B8C",
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          {LP.hero.mockupUrl}
        </div>
      </div>

      {/* Inner academy mockup */}
      <div style={{ background: "#F5F9FF", direction: "rtl" }}>
        {/* Mock nav */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "11px 18px",
            background: "#FFFFFF",
            borderBottom: "1px solid rgba(0,0,0,.06)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2A50CC" }}>
            {LP.hero.mockupBrand}
          </span>
          <div className="flex gap-[10px]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 4,
                  background: "rgba(0,0,0,.08)",
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Mock hero */}
        <div
          className="flex items-start gap-[14px]"
          style={{
            padding: "22px 18px",
            background: "linear-gradient(135deg,#EEF3FF,#F8FAFF)",
          }}
        >
          <div className="flex-1 min-w-0">
            <div
              style={{
                height: 12,
                width: "80%",
                background: "rgba(42,80,204,.45)",
                borderRadius: 3,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                height: 12,
                width: "60%",
                background: "rgba(42,80,204,.45)",
                borderRadius: 3,
                marginBottom: 13,
              }}
            />
            <div
              style={{
                height: 5,
                width: "88%",
                background: "rgba(0,0,0,.07)",
                borderRadius: 2,
                marginBottom: 5,
              }}
            />
            <div
              style={{
                height: 5,
                width: "70%",
                background: "rgba(0,0,0,.07)",
                borderRadius: 2,
                marginBottom: 5,
              }}
            />
            <div
              style={{
                height: 5,
                width: "50%",
                background: "rgba(0,0,0,.07)",
                borderRadius: 2,
                marginBottom: 10,
              }}
            />
            <div
              style={{
                width: 76,
                height: 22,
                background: "#2A50CC",
                borderRadius: 5,
              }}
            />
          </div>
          <div
            style={{
              width: 120,
              height: 82,
              flexShrink: 0,
              background: "linear-gradient(135deg,#C9D8FF,#97B4F8)",
              borderRadius: 7,
              border: "1px solid rgba(42,80,204,.12)",
            }}
          />
        </div>

        {/* Mock course cards */}
        <div
          className="grid grid-cols-3 gap-[7px]"
          style={{ padding: "0 18px 18px" }}
        >
          {(
            [
              "linear-gradient(135deg,#C9D8FF,#97B4F8)",
              "linear-gradient(135deg,#D4C9FF,#B497F8)",
              "linear-gradient(135deg,#C9EAD4,#97D4B4)",
            ] as const
          ).map((bg, i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,.07)",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,.05)",
              }}
            >
              <div style={{ height: 40, background: bg }} />
              <div style={{ padding: 7 }}>
                <div
                  style={{
                    height: 5,
                    background: "rgba(0,0,0,.18)",
                    borderRadius: 2,
                    marginBottom: 4,
                  }}
                />
                <div
                  style={{
                    height: 4,
                    width: "60%",
                    background: "rgba(0,0,0,.08)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Props = {
  adminRegisterUrl: string;
  academies: StoreSummary[];
};

export function HeroSection({ adminRegisterUrl, academies }: Props) {
  const activeCount =
    academies.length > 0
      ? `${academies.length.toLocaleString("fa-IR")}+`
      : "+۱٬۲۰۰";

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 82,
        overflow: "hidden",
      }}
    >
      {/* Ambient gradients */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 55% 65% at 62% 18%, rgba(204,122,0,.09) 0%,transparent 60%), radial-gradient(ellipse 45% 55% at 88% 70%, rgba(204,122,0,.06) 0%,transparent 55%), radial-gradient(ellipse 60% 40% at 15% 85%, rgba(11,17,51,.04) 0%,transparent 55%)",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 44px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Text — right side in RTL */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-[26px]"
              style={{
                background: "#FEF3E0",
                border: "1px solid rgba(204,122,0,.22)",
                borderRadius: 100,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#CC7A00",
              }}
            >
              <span
                className="lp-blink"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#CC7A00",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {LP.hero.badge}
            </div>

            <h1
              style={{
                fontSize: "clamp(44px,5.8vw,74px)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 22,
                letterSpacing: "-.02em",
                color: "#100F0C",
              }}
            >
              {LP.hero.h1Part1}
              <br />
              {LP.hero.h1Part2}
              <br />
              <span
                style={{
                  color: "#CC7A00",
                  position: "relative",
                  display: "inline-block",
                }}
                className="lp-hl-und"
              >
                {LP.hero.h1Highlight}
              </span>{" "}
              {LP.hero.h1End}
            </h1>

            <p
              style={{
                fontSize: 17,
                color: "#625E52",
                lineHeight: 1.9,
                maxWidth: 440,
                marginBottom: 38,
                fontWeight: 400,
              }}
            >
              {LP.hero.sub}
            </p>

            <div className="flex items-center flex-wrap gap-[14px]">
              <a href={adminRegisterUrl} className="lp-btn-amber text-white">
                {LP.hero.ctaPrimary}
              </a>
              <a href="#demos" className="lp-btn-ghost">
                {LP.hero.ctaGhost} ←
              </a>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-4 mt-10 pt-7"
              style={{ borderTop: "1px solid #E5E3DA" }}
            >
              {LP.hero.stats.map((stat, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#100F0C",
                      letterSpacing: "-.02em",
                    }}
                  >
                    {i === 0 ? activeCount : stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#A09B8C",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser mockup — left side in RTL */}
          <div className="flex justify-center lg:justify-start">
            <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-8% 4%",
                  background:
                    "radial-gradient(ellipse, rgba(204,122,0,.14), transparent 65%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <BrowserMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
