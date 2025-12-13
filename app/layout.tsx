import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/components/providers/auth-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeDarkModeApplier } from "@/components/theme/theme-dark-mode-applier";
import { I18nProvider } from "@/lib/i18n/provider";
import { env } from "@/lib/env";
import { getStoreContext } from "@/lib/store-context";
import { getSession } from "@/lib/auth/session";
import {
  getStoreThemeAndTemplate,
  generateThemeCSSVariables,
} from "@/lib/theme-config";
import { getCurrentStore, getStoreBySlug } from "@/lib/api/server";
import { getStoreLanguage, getStoreDirection, isStoreRTL } from "@/lib/i18n/server";
import type { LanguageCode } from "@/lib/i18n/config";
import { CreativeBackground } from "@/components/motion/creative-background";
import { ScrollAnimationProvider } from "@/components/motion/scroll-animation-provider";
import { resolveAssetUrl } from "@/lib/utils";

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
  const storeContext = await getStoreContext();
  const session = await getSession();
  const isAuthenticated = Boolean(session?.userId);
  
  const { theme, template } = await getStoreThemeAndTemplate();
  const themeCSS = generateThemeCSSVariables(theme);
  
  // Get store details for language and country (server-side)
  // Try to get current store first (requires auth), then fall back to public store by slug
  let currentStore = await getCurrentStore().catch(() => null);
  
  // If no authenticated store, try to get public store by slug
  if (!currentStore && storeContext.slug) {
    currentStore = await getStoreBySlug(storeContext.slug).catch(() => null);
  }

  // Extract store icons for flying animation
  const storeIcons: string[] = [];
  if (currentStore) {
    // Get logo if available
    if ((currentStore as any).logo?.publicUrl) {
      const logoUrl = resolveAssetUrl((currentStore as any).logo.publicUrl);
      if (logoUrl) storeIcons.push(logoUrl);
    }
    // Get cover image if available
    if (currentStore.cover?.publicUrl) {
      const coverUrl = resolveAssetUrl(currentStore.cover.publicUrl);
      if (coverUrl) storeIcons.push(coverUrl);
    }
    // Get other images if available
    if (currentStore.images && Array.isArray(currentStore.images)) {
      currentStore.images.slice(0, 5).forEach((img: any) => {
        const imgUrl = img.publicUrl || img.filename;
        if (imgUrl) {
          const resolvedUrl = resolveAssetUrl(imgUrl);
          if (resolvedUrl) storeIcons.push(resolvedUrl);
        }
      });
    }
  }
  
  // Filter out empty strings
  const validStoreIcons = storeIcons.filter(Boolean);
  
  // Determine language and direction from store config (server-side)
  const countryCode = currentStore?.country_code || null;
  const storeLanguage = currentStore?.language || null;
  const language = getStoreLanguage(storeLanguage, countryCode);
  const direction = getStoreDirection(storeLanguage, countryCode);
  const rtl = isStoreRTL(storeLanguage, countryCode);
  
  // Check if we're on the home page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isHomePage = pathname === "" || pathname === "/";
  const hasTemplateBlocks = template?.blocks && template.blocks.length > 0;
  
  // Always show header and footer in layout for all pages
  const useTemplateLayout = isHomePage && hasTemplateBlocks;

  // Determine data-theme attribute based on dark_mode setting
  const dataTheme = theme?.dark_mode === false 
    ? "light" 
    : theme?.dark_mode === true 
    ? "dark" 
    : undefined;

  return (
    <html 
      lang={language}
      dir={direction}
      suppressHydrationWarning
      data-theme={dataTheme}
      // Don't force dark mode - let system preference handle it
      style={{
        colorScheme: "light dark", // Support both, let system decide
      } as React.CSSProperties}
    >
      <head>
        {themeCSS && (
          <style 
            dangerouslySetInnerHTML={{ 
              __html: themeCSS // CSS variables from server - safe as generated internally
            }} 
          />
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={
          theme
            ? {
                // Use appropriate colors based on dark_mode setting
                backgroundColor: theme.dark_mode === true
                  ? (theme.background_color_dark || theme.background_color || "#0f172a")
                  : (theme.background_color_light || theme.background_color || "#f8fafc"),
                // CSS variables are set in the <style> tag above via generateThemeCSSVariables
              } as React.CSSProperties
            : undefined
        }
      >
        <AuthProvider initialAuthenticated={isAuthenticated}>
          <StoreProvider initialValue={storeContext}>
            <ThemeProvider initialTheme={theme}>
            <ThemeDarkModeApplier darkMode={theme?.dark_mode} />
            <I18nProvider initialLanguage={language} countryCode={countryCode || undefined}>
              <ScrollAnimationProvider>
                <div
                  className="relative flex min-h-screen flex-col transition-colors duration-200 bg-slate-50/70 text-slate-900 dark:bg-slate-900 dark:text-slate-100 overflow-hidden"
                >
                  {/* Creative animated background with gradients and flying icons */}
                  <CreativeBackground theme={theme} storeIcons={validStoreIcons} />
                  
                  <SiteHeader />
                  <main className="relative flex-1 z-10">
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
              </ScrollAnimationProvider>
            </I18nProvider>
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
