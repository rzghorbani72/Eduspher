"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

import { useI18n } from "@/lib/i18n/provider";

interface AuthShellProps {
  academyName: string;
  academySubtitle?: string;
  academyTagline?: string;
  logoUrl?: string | null;
  logoGlyph: string;
  children: React.ReactNode;
}

export function AuthShell({
  academyName,
  academySubtitle,
  logoUrl,
  logoGlyph,
  children,
}: AuthShellProps) {
  const pathname = usePathname();
  const { language, setLanguage } = useI18n();

  const nextLanguage = language === "fa" ? "en" : "fa";

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden />

      <div className="auth-ctrl">
        <button
          type="button"
          className="auth-pill"
          onClick={() => setLanguage(nextLanguage)}
        >
          <Globe size={12} />
          {nextLanguage === "en" ? "English" : "فارسی"}
        </button>
      </div>

      <div className="auth-body">
        <div className="auth-card">
          <div className="auth-head">
            <div className="auth-logo-wrap">
              <div className="auth-logo">
                {logoUrl ? (
                  <Image src={logoUrl} alt={academyName} width={46} height={46} />
                ) : (
                  logoGlyph
                )}
              </div>
            </div>
            <div>
              <div className="auth-name">{academyName}</div>
              {academySubtitle ? (
                <div className="auth-sub">{academySubtitle}</div>
              ) : null}
            </div>
          </div>

          <div className="auth-card-body" key={pathname}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
