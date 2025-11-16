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

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider initialAuthenticated={isAuthenticated}>
          <SchoolProvider initialValue={schoolContext}>
            <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              <SiteHeader />
              <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16 md:py-20">{children}</div>
              </main>
              <SiteFooter />
            </div>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
