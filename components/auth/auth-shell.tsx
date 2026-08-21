"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

import { useI18n } from "@/lib/i18n/provider";
import { useTranslation } from "@/lib/i18n/hooks";

interface AuthShellProps {
  academyName: string;
  academySubtitle?: string;
  academyTagline?: string;
  logoUrl?: string | null;
  logoGlyph: string;
  children: React.ReactNode;
}

function AcademyLogo({
  academyName,
  logoUrl,
  logoGlyph,
  size,
}: Pick<AuthShellProps, "academyName" | "logoUrl" | "logoGlyph"> & { size: number }) {
  return (
    <div className="auth-logo-wrap">
      <div className="auth-logo">
        {logoUrl ? (
          <Image src={logoUrl} alt={academyName} width={size} height={size} />
        ) : (
          logoGlyph
        )}
      </div>
    </div>
  );
}

const HEADING_KEYS = [
  { match: "/auth/register", title: "auth.registerTitle", subtitle: "auth.registerSubtitle" },
  { match: "/auth/forgot-password", title: "auth.forgotTitle", subtitle: "auth.forgotSubtitle" },
  { match: "/auth/login", title: "auth.loginTitle", subtitle: "auth.loginSubtitle" },
] as const;

export function AuthShell({
  academyName,
  academySubtitle,
  academyTagline,
  logoUrl,
  logoGlyph,
  children,
}: AuthShellProps) {
  const pathname = usePathname();
  const { language, setLanguage } = useI18n();
  const { t } = useTranslation();

  const nextLanguage = language === "fa" ? "en" : "fa";
  const tagline = academyTagline ?? t("auth.academyPanelTagline");
  const heading = HEADING_KEYS.find((entry) => pathname.includes(entry.match));

  return (
    <div className="auth-page">
      <div className="auth-frame">
        <div className="auth-pane">
          <div className="auth-card" key={pathname}>
            {heading ? (
              <div className="auth-title-wrap">
                <h1 className="auth-title">{t(heading.title)}</h1>
                <p className="auth-subtitle">{t(heading.subtitle)}</p>
              </div>
            ) : null}
            <div className="auth-card-body">{children}</div>
          </div>
        </div>

        <div className="auth-brand">
          <AcademyLogo
            academyName={academyName}
            logoUrl={logoUrl}
            logoGlyph={logoGlyph}
            size={76}
          />
          <div className="auth-brand-name">{academyName}</div>
          <p className="auth-brand-tagline">{tagline}</p>
          {academySubtitle ? <div className="auth-brand-sub">{academySubtitle}</div> : null}
        </div>

        <div className="auth-ctrl">
          <button type="button" className="auth-pill" onClick={() => setLanguage(nextLanguage)}>
            <Globe size={12} />
            {nextLanguage === "en" ? "English" : "فارسی"}
          </button>
        </div>
      </div>
    </div>
  );
}
