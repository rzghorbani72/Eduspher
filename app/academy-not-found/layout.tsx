import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Soft 404 for unknown academy hosts — never index. */
export const metadata: Metadata = {
  title: "Academy not found",
  robots: { index: false, follow: false },
};

export default function AcademyNotFoundLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
