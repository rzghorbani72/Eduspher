import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SchoolProvider } from "@/components/providers/school-provider";
import { env } from "@/lib/env";
import { getSchoolContext } from "@/lib/school-context";
import { getSession } from "@/lib/auth/session";
import {
  getSchoolThemeAndTemplate,
  generateThemeCSSVariables,
} from "@/lib/theme-config";

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

  return (
    <html lang="en" suppressHydrationWarning>
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
                colorScheme: theme.dark_mode ? "dark" : "light",
                // Apply theme colors as CSS variables for use in components
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
            <div
              className={`flex min-h-screen flex-col ${
                theme?.dark_mode
                  ? "dark bg-slate-900 text-slate-100"
                  : "bg-slate-50/70 text-slate-900"
              }`}
            >
              {/* Conditionally render header/footer if not in template */}
              {!template?.blocks?.some((b) => b.type === "header" && b.isVisible) && <SiteHeader />}
              <main className="flex-1">
                {/* If UI template exists, let blocks handle their own layout */}
                {/* Otherwise use default container */}
                {template?.blocks && template.blocks.length > 0 ? (
                  <>{children}</>
                ) : (
                  <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16 md:py-20">
                    {children}
                  </div>
                )}
              </main>
              {!template?.blocks?.some((b) => b.type === "footer" && b.isVisible) && <SiteFooter />}
            </div>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
