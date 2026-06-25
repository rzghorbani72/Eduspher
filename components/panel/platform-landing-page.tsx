"use client";

import { useState } from "react";
import type { StoreSummary } from "@/lib/api/types";
import { HomeHeader } from "./platform-landing/home-header";
import { HeroSection } from "./platform-landing/hero-section";
import { TrustStrip } from "./platform-landing/trust-strip";
import { MetricsSection } from "./platform-landing/metrics-section";
import { FeaturesSection } from "./platform-landing/features-section";
import { HowSection } from "./platform-landing/how-section";
import { ExamplesSection } from "./platform-landing/examples-section";
import { ComparisonSection } from "./platform-landing/comparison-section";
import { FounderSection } from "./platform-landing/founder-section";
import { TestimonialsSection } from "./platform-landing/testimonials-section";
import { PricingSection } from "./platform-landing/pricing-section";
import { FaqSection } from "./platform-landing/faq-section";
import { CtaSection } from "./platform-landing/cta-section";
import { HomeFooter } from "./platform-landing/home-footer";
import { LandingScrollReveal } from "./platform-landing/landing-scroll-reveal";

type Theme = "light" | "dark";

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
};

export function PlatformLandingPage({ adminLoginUrl, adminRegisterUrl }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("mentoma-theme") as Theme | null;
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("mentoma-theme", next); } catch {}
  };

  return (
    <div
      id="top"
      className={`mentoma-page${theme === "dark" ? " theme-dark" : ""}`}
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        lineHeight: 1.6,
        fontFamily: "'Vazirmatn', system-ui, sans-serif",
      }}
    >
      {/* Ambient background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-12%", right: "-8%", width: "46vw", height: "46vw", borderRadius: "50%", background: "radial-gradient(circle at 30% 30%,rgba(124,108,255,.30),transparent 62%)", filter: "blur(20px)" }} />
        <div style={{ position: "absolute", top: "24%", left: "-10%", width: "42vw", height: "42vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%,rgba(79,140,255,.24),transparent 64%)", filter: "blur(24px)" }} />
      </div>

      <LandingScrollReveal />

      <div style={{ position: "relative", zIndex: 1 }}>
        <HomeHeader theme={theme} toggleTheme={toggleTheme} adminLoginUrl={adminLoginUrl} adminRegisterUrl={adminRegisterUrl} />

        <main>
          <HeroSection adminRegisterUrl={adminRegisterUrl} />
          <TrustStrip />
          <MetricsSection />
          <FeaturesSection />
          <HowSection />
          <ExamplesSection />
          <ComparisonSection />
          <FounderSection />
          <TestimonialsSection />
          <PricingSection />
          <FaqSection />
          <CtaSection adminRegisterUrl={adminRegisterUrl} />
        </main>

        <HomeFooter />
      </div>
    </div>
  );
}
