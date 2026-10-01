import { HeroBg } from './shared';

export function HeroOverlay({ bg }: { bg: HeroBg }) {
  if (bg.kind !== 'image' || bg.overlay <= 0) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ backgroundColor: `rgba(0, 0, 0, ${bg.overlay / 100})` }}
    />
  );
}
