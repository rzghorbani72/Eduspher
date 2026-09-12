import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

import { LegalConsentGate } from "@/components/legal/legal-consent-gate";
import {
  TemplateFooter,
  TemplateHeader,
} from "@/components/layout/template-chrome";
import { MainContainer } from "@/components/layout/main-container";
import { getHeaderUser } from "@/app/actions/auth";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
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
  getActiveStudentDiscounts,
} from "@/lib/api/server";
import { EnrollmentClosedBanner } from "@/components/academy/enrollment-closed-banner";
import { ActiveDiscountBanner } from "@/components/academy/active-discount-banner";
import { EnrollmentStatusProvider } from "@/components/academy/enrollment-status-provider";
import { getAcademyLanguage, getAcademyDirection } from "@/lib/i18n/server";
import { CreativeBackgroundLazy } from "@/components/motion/creative-background-lazy";
import { PreviewModeBanner } from "@/components/theme/preview-mode-banner";
import { ScrollAnimationProvider } from "@/components/motion/scroll-animation-provider";
import { resolveAssetUrl } from "@/lib/utils";
import { GdprConsentBanner } from "@/components/gdpr-consent-banner";
import { ToastContainerWrapper } from "@/components/providers/toast-container-wrapper";
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
  // Auth routes keep the site header/footer, but bring their own gradient
  // background, so only the creative background is stripped.
  const isAuth =
    urlPathname.startsWith("/auth") || pathname.startsWith("/auth");
  // Admin master-template preview: the draft renders on the academy path but
  // must look like a neutral sample site — strip academy chrome and identity so
  // no academy name/logo/imagery leaks into the master being authored.
  const isSamplePreview = headersList.get("x-preview-sample") === "1";
  const shellKey = isPanelRoot
    ? "panel"
    : `${storeContext.slug ?? ""}-${storeContext.id ?? 0}`;
  const headerUser =
    isAuthenticated && !isPanelRoot
      ? await getHeaderUser()
      : { displayName: null, avatarUrl: null };

  const { theme } = await getStoreThemeAndTemplate();
  const themeCSS = generateThemeCSSVariables(theme);
  const themeKey = isPanelRoot
    ? "panel"
    : `${storeContext.slug ?? ""}-${storeContext.id ?? 0}-${theme?.primary_color ?? "default"}`;

  // Get store details for language and country (server-side)
  // Try to get current store first (requires auth), then fall back to public store by slug
  // The platform root has no academy, so every academy lookup below is a
  // guaranteed miss. Skipping them keeps the marketing page off the backend.
  let currentAcademy = isPanelRoot
    ? null
    : await getCurrentAcademy().catch(() => null);

  // If no authenticated store, try to get public store by slug
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(
      () => null,
    );
  }

  // Closed to new enrollments: the site stays up, so the banner explains it once
  // at the top for visitors and students alike.
  const enrollmentStatus = storeContext.slug
    ? await getAcademyEnrollmentStatus(storeContext.slug)
    : null;

  const activeStudentDiscounts = storeContext.slug
    ? await getActiveStudentDiscounts(storeContext.slug)
    : [];

  // Extract store icons for flying animation
  const storeIcons: string[] = [];
  if (currentAcademy) {
    // Get logo if available
    if ((currentAcademy as { logo?: { publicUrl?: string } }).logo?.publicUrl) {
      const logoUrl = resolveAssetUrl(
        (currentAcademy as { logo?: { publicUrl?: string } }).logo!.publicUrl,
      );
      if (logoUrl) storeIcons.push(logoUrl);
    }
    // Get cover image if available
    if (currentAcademy.cover?.publicUrl) {
      const coverUrl = resolveAssetUrl(currentAcademy.cover.publicUrl);
      if (coverUrl) storeIcons.push(coverUrl);
    }
    // Get other images if available
    if (currentAcademy.images && Array.isArray(currentAcademy.images)) {
      currentAcademy.images
        .slice(0, 5)
        .forEach((img: { publicUrl?: string; filename?: string }) => {
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
  const direction =
    (theme?.text_direction as "ltr" | "rtl" | undefined) ??
    getAcademyDirection(storeLanguage, countryCode);

  const bareLayout = isPanelRoot || isPreview || isSamplePreview;
  // Paths that render the full-bleed academy home template, as the BROWSER sees
  // them (subdomain academies live at "/", path-based ones at "/{slug}").
  // MainContainer re-checks these on every client navigation.
  const academyHomePaths = isPanelRoot
    ? ["/"]
    : ["/", ...(storeContext.slug ? [`/${storeContext.slug}`] : [])];

  // Determine data-theme attribute based on dark_mode setting
  const dataTheme =
    theme?.dark_mode === false
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
      style={
        {
          colorScheme: "light dark", // Support both, let system decide
        } as React.CSSProperties
      }
    >
      <head>
        {/* The only family the chrome actually renders. Preloading it stops the
            headings swapping in after first paint (same as AdminPanel). */}
        <link
          rel="preload"
          href="/fonts/vazirmatn.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased"
        style={
          {
            backgroundColor: "var(--theme-background)",
            color: "var(--theme-foreground)",
          } as React.CSSProperties
        }
      >
        <style
          id="academy-theme-vars"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeCSS }}
        />
        <QueryProvider>
          <AuthProvider
            initialAuthenticated={isAuthenticated}
            logContext={{
              user_id: session?.userId,
              academy_id: session?.academyId,
              role: session?.roles[0],
            }}
          >
            <ShellProvider
              key={shellKey}
              isPanelRoot={isPanelRoot}
              headerDisplayName={headerUser.displayName}
              headerAvatarUrl={headerUser.avatarUrl}
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
                      <ScrollAnimationProvider enabled={!isPanelRoot}>
                        <div
                          className="relative flex min-h-screen flex-col transition-colors duration-200 overflow-x-clip"
                          style={{
                            backgroundColor: "var(--theme-background)",
                            color: "var(--theme-foreground)",
                          }}
                        >
                          {/* Creative animated background with gradients and flying icons */}
                          {!isPreview &&
                            !isSamplePreview &&
                            !isAuth &&
                            !isPanelRoot && (
                              <CreativeBackgroundLazy
                                theme={theme}
                                storeIcons={validStoreIcons}
                              />
                            )}

                          {!bareLayout && activeStudentDiscounts.length > 0 && (
                            <ActiveDiscountBanner
                              discounts={activeStudentDiscounts}
                              currencyCode={currentAcademy?.currency ?? "IRR"}
                            />
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
                          {!bareLayout && <TemplateHeader />}
                          <main className="relative flex-1 z-10">
                            <MainContainer
                              fullWidth={isPanelRoot || isSamplePreview}
                              homePaths={academyHomePaths}
                            >
                              {children}
                            </MainContainer>
                          </main>
                          {!bareLayout && <TemplateFooter />}
                          {/* Pending terms 403 every authenticated call site-wide, not
                      just under /account, so the only way back in lives here. */}
                          {isAuthenticated && !bareLayout && (
                            <LegalConsentGate />
                          )}
                        </div>
                      </ScrollAnimationProvider>
                    </EnrollmentStatusProvider>
                    {process.env.NEXT_PUBLIC_GDPR_ENABLED === "true" && (
                      <GdprConsentBanner />
                    )}
                    <ToastContainerWrapper />
                  </I18nProvider>
                </ThemeProvider>
              </StoreProvider>
            </ShellProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
