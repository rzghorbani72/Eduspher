import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Rewrite target used by the proxy when a subdomain host matches no academy.
// It exists only to return a real 404 status instead of rendering any page.
export default function AcademyNotFoundPage(): never {
  notFound();
}
