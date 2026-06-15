"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Sparkles } from "lucide-react";

import Link from "@/components/ui/link";
import { useStorePath } from "@/components/providers/store-provider";
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

const TABS = [
  { id: "login", path: "/auth/login", key: "auth.signIn" },
  { id: "register", path: "/auth/register", key: "auth.register" },
  { id: "forgot", path: "/auth/forgot-password", key: "auth.resetPassword" },
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
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const { language, setLanguage } = useI18n();

  const nextLanguage = language === "fa" ? "en" : "fa";

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden>
        <div className="auth-blob auth-blob-tl" />
        <div className="auth-blob auth-blob-br" />
        <div className="auth-blob auth-blob-cc" />
        <div className="auth-ghost">{logoGlyph}</div>
      </div>

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
              <div className="auth-logo-glow" aria-hidden />
              <div className="auth-logo">
                {logoUrl ? (
                  <Image src={logoUrl} alt={academyName} width={72} height={72} />
                ) : (
                  logoGlyph
                )}
              </div>
            </div>
            <div className="auth-name">{academyName}</div>
            {academySubtitle ? <div className="auth-sub">{academySubtitle}</div> : null}
            {academyTagline ? <div className="auth-tagline">{academyTagline}</div> : null}
          </div>

          <nav className="auth-tabs">
            {TABS.map((tab) => {
              const active = pathname?.endsWith(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={buildPath(tab.path)}
                  className={`auth-tab${active ? " on" : ""}`}
                >
                  {t(tab.key)}
                </Link>
              );
            })}
          </nav>

          <div className="auth-card-body" key={pathname}>
            {children}
          </div>

          <div className="auth-foot">
            <Sparkles size={11} />
            {language === "fa" ? "ساخته شده با منتوریار" : "Built with Mentoryar"}
          </div>
        </div>
      </div>
    </div>
  );
}
