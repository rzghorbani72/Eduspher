import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
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
  
  // Check if we're on the home page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isHomePage = pathname === "" || pathname === "/";
  const hasTemplateBlocks = template?.blocks && template.blocks.length > 0;
  
  // Always show header and footer on all pages (including login, register, etc.)
  const showHeader = true;
  const showFooter = true;
  const useTemplateLayout = isHomePage && hasTemplateBlocks;

  return (
    <html 
      lang="en" 
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
                // Use backend colors as-is - no conversion
                // System preference will determine dark/light mode via CSS media queries
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
            <div
              className="flex min-h-screen flex-col transition-colors duration-200 bg-slate-50/70 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              // Let CSS media query handle dark/light mode based on system preference
            >
              {/* Show header on all pages */}
              {showHeader && <SiteHeader />}
              <main className="flex-1">
                {/* Home page with template: let blocks handle their own layout */}
                {/* All other pages: use centered container with proper spacing */}
                {useTemplateLayout ? (
                  <>{children}</>
                ) : (
                  <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                    {children}
                  </div>
                )}
              </main>
              {/* Show footer on all pages */}
              {showFooter && <SiteFooter />}
            </div>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
