import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderShell } from "@/components/layout/site-header-shell";
import { getUserDisplayName } from "@/app/actions/auth";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ShellProvider } from "@/components/providers/shell-provider";
import { getRequestHost } from "@/lib/request-host";
import { StoreProvider } from "@/components/providers/store-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeDarkModeApplier } from "@/components/theme/theme-dark-mode-applier";
import { ThemeLiveUpdater } from "@/components/theme/theme-live-updater";
import { ThemeToggleButton } from "@/components/theme/theme-toggle-button";
import { ThemeStyleSync } from "@/components/theme/theme-style-sync";
import { I18nProvider } from "@/lib/i18n/provider";
import { DocumentLangSync } from "@/lib/i18n/document-lang-sync";
import { getAcademyContext } from "@/lib/store-context";
import { getSession } from "@/lib/auth/session";
import {
  getStoreThemeAndTemplate,
  generateThemeCSSVariables,
} from "@/lib/theme-config";
import {
  getCurrentAcademy,
  getAcademyBySlug,
  getAcademyEnrollmentStatus,
} from "@/lib/api/server";
import { EnrollmentClosedBanner } from "@/components/academy/enrollment-closed-banner";
import { EnrollmentStatusProvider } from "@/components/academy/enrollment-status-provider";
import { getAcademyLanguage, getAcademyDirection } from "@/lib/i18n/server";
import { CreativeBackground } from "@/components/motion/creative-background";
import { PreviewModeBanner } from "@/components/theme/preview-mode-banner";
import { ScrollAnimationProvider } from "@/components/motion/scroll-animation-provider";
import { resolveAssetUrl } from "@/lib/utils";
import { GdprConsentBanner } from "@/components/gdpr-consent-banner";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeContext = await getAcademyContext();
  const session = await getSession();
  const isAuthenticated = Boolean(session?.userId);
  const headersList = await headers();
  const requestHost = await getRequestHost();
  const pathname = headersList.get("x-pathname") || "";
  const urlPathname = headersList.get("x-url-pathname") || pathname;
  // Trust the middleware signal; fall back to URL check when middleware is not running.
  const isPanelRoot =
    headersList.get("x-panel-root") === "1" ||
    urlPathname === "/" ||
    urlPathname === "";
  // Standalone section/template render surface embedded by AdminPanel — no
  // header/footer/banner chrome, raw full-width children.
  const isPreview =
    urlPathname.startsWith("/preview") || pathname.startsWith("/preview");
  // Auth routes render as a self-contained full-screen experience (its own
  // gradient background, card, and controls) — strip the site chrome.
  const isAuth =
    urlPathname.startsWith("/auth") || pathname.startsWith("/auth");
  // Admin master-template preview: the draft renders on the academy path but
  // must look like a neutral sample site — strip academy chrome and identity so
  // no academy name/logo/imagery leaks into the master being authored.
  const isSamplePreview = headersList.get("x-preview-sample") === "1";
  const shellKey = isPanelRoot ? "panel" : `${storeContext.slug ?? ""}-${storeContext.id ?? 0}`;
  const headerDisplayName =
    isAuthenticated && !isPanelRoot ? (await getUserDisplayName()).displayName : null;
  
  const { theme } = await getStoreThemeAndTemplate();
  const themeCSS = generateThemeCSSVariables(theme);
  const themeKey = isPanelRoot
    ? "panel"
    : `${storeContext.slug ?? ""}-${storeContext.id ?? 0}-${theme?.primary_color ?? "default"}`;
  
  // Get store details for language and country (server-side)
  // Try to get current store first (requires auth), then fall back to public store by slug
  let currentAcademy = await getCurrentAcademy().catch(() => null);
  
  // If no authenticated store, try to get public store by slug
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }

  // Closed to new enrollments: the site stays up, so the banner explains it once
  // at the top for visitors and students alike.
  const enrollmentStatus = storeContext.slug
    ? await getAcademyEnrollmentStatus(storeContext.slug)
    : null;

  // Extract store icons for flying animation
  const storeIcons: string[] = [];
  if (currentAcademy) {
    // Get logo if available
    if ((currentAcademy as { logo?: { publicUrl?: string } }).logo?.publicUrl) {
      const logoUrl = resolveAssetUrl((currentAcademy as { logo?: { publicUrl?: string } }).logo!.publicUrl);
      if (logoUrl) storeIcons.push(logoUrl);
    }
    // Get cover image if available
    if (currentAcademy.cover?.publicUrl) {
      const coverUrl = resolveAssetUrl(currentAcademy.cover.publicUrl);
      if (coverUrl) storeIcons.push(coverUrl);
    }
    // Get other images if available
    if (currentAcademy.images && Array.isArray(currentAcademy.images)) {
      currentAcademy.images.slice(0, 5).forEach((img: { publicUrl?: string; filename?: string }) => {
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
  const countryCode = currentAcademy?.country_code || null;
  const storeLanguage = currentAcademy?.language || null;
  const language = getAcademyLanguage(storeLanguage, countryCode);
  // theme.text_direction overrides the language-derived default so the manager
  // can set direction independently (e.g. English content in an RTL layout).
  const direction = (theme?.text_direction as 'ltr' | 'rtl' | undefined) ?? getAcademyDirection(storeLanguage, countryCode);

  const isAcademyHome = headersList.get("x-academy-home") === "1";
  const isHomePage = pathname === "" || pathname === "/" || isAcademyHome;
  
  const bareLayout = isPanelRoot || isPreview || isSamplePreview || isAuth;
  const useTemplateLayout =
    isPreview || isSamplePreview || (!isPanelRoot && isHomePage);
  const mainClassName = bareLayout
    ? "w-full"
    : "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12";

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
      <body
        suppressHydrationWarning
        className="antialiased"
        style={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-foreground)',
        } as React.CSSProperties}
      >
        <style
          id="academy-theme-vars"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeCSS }}
        />
        <AuthProvider initialAuthenticated={isAuthenticated}>
          <ShellProvider
            key={shellKey}
            isPanelRoot={isPanelRoot}
            headerDisplayName={headerDisplayName}
            headerIsAuthenticated={isAuthenticated}
            requestHost={requestHost}
          >
          <StoreProvider key={shellKey} initialValue={storeContext}>
            <ThemeProvider key={themeKey} initialTheme={theme}>
            <ThemeStyleSync theme={theme} syncKey={themeKey} />
            <ThemeDarkModeApplier darkMode={theme?.dark_mode} />
            <ThemeLiveUpdater />
            {bareLayout && <ThemeToggleButton />}
            <I18nProvider
              key={`i18n-${shellKey}-${language}`}
              initialLanguage={language}
              countryCode={countryCode || undefined}
            >
              <DocumentLangSync />
              <EnrollmentStatusProvider
                closed={Boolean(enrollmentStatus?.disabled)}
              >
              <ScrollAnimationProvider>
                <div
                  className="relative flex min-h-screen flex-col transition-colors duration-200 overflow-x-clip"
                  style={{ backgroundColor: 'var(--theme-background)', color: 'var(--theme-foreground)' }}
                >
                  {/* Creative animated background with gradients and flying icons */}
                  {!isPreview && !isSamplePreview && !isAuth && (
                    <CreativeBackground theme={theme} storeIcons={validStoreIcons} />
                  )}

                  {!bareLayout && <PreviewModeBanner />}
                  {!bareLayout && enrollmentStatus?.disabled && (
                    <EnrollmentClosedBanner
                      message={enrollmentStatus.message}
                      reopensAt={enrollmentStatus.disabled_until}
                      contactPhone={enrollmentStatus.contact_phone}
                      contactEmail={enrollmentStatus.contact_email}
                    />
                  )}
                  {!bareLayout && <SiteHeaderShell />}
                  <main className="relative flex-1 z-10">
                    {useTemplateLayout ? (
                      <>{children}</>
                    ) : (
                      <div className={mainClassName}>
                        {children}
                      </div>
                    )}
                  </main>
                  {!bareLayout && <SiteFooter />}
                </div>
              </ScrollAnimationProvider>
              </EnrollmentStatusProvider>
              {process.env.NEXT_PUBLIC_GDPR_ENABLED === 'true' && <GdprConsentBanner />}
            </I18nProvider>
            </ThemeProvider>
          </StoreProvider>
          </ShellProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
