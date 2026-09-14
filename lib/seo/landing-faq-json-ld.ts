import { LANDING } from '@/components/panel/landing/landing.messages';

/** FAQPage schema for the marketing landing — eligible for FAQ rich results. */
export function buildLandingFaqJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LANDING.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}
