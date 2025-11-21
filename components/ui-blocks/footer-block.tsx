import { SiteFooter } from "@/components/layout/site-footer";

interface FooterBlockProps {
  config?: {
    showSocialLinks?: boolean;
    showNewsletter?: boolean;
    columns?: number;
    minimal?: boolean;
    compact?: boolean;
    showLegal?: boolean;
  };
}

export function FooterBlock({ config }: FooterBlockProps) {
  // SiteFooter component already exists
  // We can extend it later to respect config options
  return <SiteFooter />;
}

