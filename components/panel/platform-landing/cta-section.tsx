"use client";

import { useState } from "react";
import { LP } from "../platform-landing-page.messages";

export function CtaSection({ adminRegisterUrl }: { adminRegisterUrl: string }) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = email
      ? `${adminRegisterUrl}?email=${encodeURIComponent(email)}`
      : adminRegisterUrl;
    window.location.href = url;
  }

  return (
    <section
      style={{
        background: "#0B1133",
        padding: "120px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 75% at 50% 30%, rgba(204,122,0,.12), transparent 65%), radial-gradient(ellipse 40% 50% at 10% 85%, rgba(204,122,0,.06), transparent 60%)",
        }}
      />

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 44px",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(36px,5.2vw,64px)",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 18,
            color: "#FAFAF8",
            letterSpacing: "-.03em",
          }}
        >
          {LP.cta.line1}
          <br />
          {LP.cta.line2}
          <br />
          <span style={{ color: "#CC7A00" }}>{LP.cta.highlight}</span>
        </h2>

        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,.5)",
            lineHeight: 1.9,
            marginBottom: 44,
          }}
        >
          {LP.cta.sub}
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-[10px] justify-center"
          style={{ maxWidth: 450, margin: "0 auto" }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={LP.cta.placeholder}
            dir="ltr"
            style={{
              flex: 1,
              background: "rgba(255,255,255,.07)",
              border: "1.5px solid rgba(255,255,255,.12)",
              borderRadius: 10,
              padding: "13px 18px",
              fontSize: 15,
              color: "#FAFAF8",
              outline: "none",
              transition: "border-color .2s",
              textAlign: "right",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(204,122,0,.6)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.12)")}
          />
          <button type="submit" className="lp-btn-amber">
            {LP.cta.button}
          </button>
        </form>
      </div>
    </section>
  );
}
