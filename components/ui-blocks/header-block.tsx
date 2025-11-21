import { SiteHeader } from "@/components/layout/site-header";

interface HeaderBlockProps {
  config?: {
    showLogo?: boolean;
    showNavigation?: boolean;
    navigationStyle?: "horizontal" | "vertical";
    sticky?: boolean;
    transparent?: boolean;
    compact?: boolean;
    minimal?: boolean;
  };
}

export function HeaderBlock({ config }: HeaderBlockProps) {
  // SiteHeader component already exists and handles navigation
  // We can extend it later to respect config options
  return <SiteHeader />;
}

