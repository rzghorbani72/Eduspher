"use client";

import { useState, useEffect } from "react";
import { LP } from "../platform-landing-page.messages";

export function LandingHeader({ adminLoginUrl }: { adminLoginUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: 200,
        padding: "16px 0",
        transition: "background .3s, border-color .3s, box-shadow .3s",
        ...(scrolled
          ? {
              background: "rgba(248,247,242,.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid #E5E3DA",
              boxShadow: "0 1px 20px rgba(0,0,0,.05)",
            }
          : {}),
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}>
        <div className="flex items-center justify-between">
          <a
            href="/"
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#100F0C",
              textDecoration: "none",
              letterSpacing: "-.01em",
            }}
          >
            {LP.nav.logoText}
            <em style={{ color: "#CC7A00", fontStyle: "normal" }}>{LP.nav.logoHighlight}</em>
          </a>

          <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
            {LP.nav.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="lp-nav-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a href={adminLoginUrl} className="lp-btn-nav hidden md:inline-block">
            {LP.nav.login}
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#625E52", fontSize: 22, padding: 4 }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ borderTop: "1px solid #E5E3DA", paddingTop: 16, paddingBottom: 16, marginTop: 12 }}>
            <ul className="flex flex-col gap-4 list-none m-0 p-0">
              {LP.nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="lp-nav-link"
                    style={{ fontSize: 15 }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={adminLoginUrl}
              className="lp-btn-nav"
              style={{ display: "block", marginTop: 16, textAlign: "center" }}
            >
              {LP.nav.login}
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
