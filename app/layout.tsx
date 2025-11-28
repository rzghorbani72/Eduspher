import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SchoolProvider } from "@/components/providers/school-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { env } from "@/lib/env";
import { getSchoolContext } from "@/lib/school-context";
import { getSession } from "@/lib/auth/session";
import {
  getSchoolThemeAndTemplate,
  generateThemeCSSVariables,
} from "@/lib/theme-config";
import { getCurrentSchool } from "@/lib/api/server";
import { getSchoolLanguage, getSchoolDirection, isSchoolRTL } from "@/lib/i18n/server";
import type { LanguageCode } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: env.siteName,
    template: `%s | ${env.siteName}`,
  },
  description: env.siteDescription,
  openGraph: {
    title: env.siteName,
    description: env.siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: env.siteName,
    description: env.siteDescription,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schoolContext = await getSchoolContext();
  const session = await getSession();
  const isAuthenticated = Boolean(session?.userId);
  
  const { theme, template } = await getSchoolThemeAndTemplate();
  const themeCSS = generateThemeCSSVariables(theme);
  
  // Get school details for language and country (server-side)
  // Try to get current school first (requires auth), then fall back to public school by slug
  let currentSchool = await getCurrentSchool().catch(() => null);
  
  // If no authenticated school, try to get public school by slug
  if (!currentSchool && schoolContext.slug) {
    const { getSchoolBySlug } = await import("@/lib/api/server");
    currentSchool = await getSchoolBySlug(schoolContext.slug).catch(() => null);
  }
  
  // Determine language and direction from school config (server-side)
  const countryCode = currentSchool?.country_code || null;
  const schoolLanguage = currentSchool?.language || null;
  const language = getSchoolLanguage(schoolLanguage, countryCode);
  const direction = getSchoolDirection(schoolLanguage, countryCode);
  const rtl = isSchoolRTL(schoolLanguage, countryCode);
  
  // Check if we're on the home page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isHomePage = pathname === "" || pathname === "/";
  const hasTemplateBlocks = template?.blocks && template.blocks.length > 0;
  
  // Always show header and footer in layout for all pages
  const useTemplateLayout = isHomePage && hasTemplateBlocks;

  return (
    <html 
      lang={language}
      dir={direction}
      suppressHydrationWarning
      // Don't force dark mode - let system preference handle it
      style={{
        colorScheme: "light dark", // Support both, let system decide
      } as React.CSSProperties}
    >
      <head>
        {themeCSS && (
          <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={
          theme
            ? {
                backgroundColor: theme.background_color || undefined,
                "--theme-primary": theme.primary_color || "#3b82f6",
                "--theme-secondary": theme.secondary_color || "#6366f1",
                "--theme-accent": theme.accent_color || "#f59e0b",
                "--theme-background": theme.background_color || "#f8fafc",
              } as React.CSSProperties
            : undefined
        }
      >
        <AuthProvider initialAuthenticated={isAuthenticated}>
          <SchoolProvider initialValue={schoolContext}>
            <I18nProvider initialLanguage={language} countryCode={countryCode || undefined}>
              <div
                className="flex min-h-screen flex-col transition-colors duration-200 bg-slate-50/70 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              >
                <SiteHeader />
                <main className="flex-1">
                  {useTemplateLayout ? (
                    <>{children}</>
                  ) : (
                    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                      {children}
                    </div>
                  )}
                </main>
                <SiteFooter />
              </div>
            </I18nProvider>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
