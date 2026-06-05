import { LP } from "../platform-landing-page.messages";
import type { StoreSummary } from "@/lib/api/types";

export function ProofBar({ academies }: { academies: StoreSummary[] }) {
  const names =
    academies.length > 0 ? academies.map((a) => a.name) : [...LP.proof.fallback];
  const doubled = [...names, ...names];

  return (
    <div style={{ background: "#0B1133", padding: "14px 0", overflow: "hidden" }}>
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "rgba(255,255,255,.35)",
          marginBottom: 11,
          letterSpacing: ".05em",
          fontWeight: 500,
        }}
      >
        {LP.proof.label}
      </p>
      <div className="flex overflow-hidden" dir="ltr">
        <div className="lp-proof-strip flex shrink-0 gap-0">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-[10px] whitespace-nowrap"
              style={{ padding: "0 36px", borderLeft: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)", fontSize: 14, fontWeight: 500 }}
            >
              <span
                style={{ width: 4, height: 4, borderRadius: "50%", background: "#CC7A00", flexShrink: 0, display: "inline-block" }}
              />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
