import { resolveAssetUrl } from '@/lib/utils';
import { SectionMedia, type MediaSize } from '../section-media';
import { HeroBlockProps } from './shared';

// Shared illustration slot — owner-uploaded image with bounded size/aspect.
export function HeroMedia({
  config,
  defaultSize = 'lg',
}: {
  config?: HeroBlockProps['config'];
  defaultSize?: MediaSize;
}) {
  return (
    <SectionMedia
      src={resolveAssetUrl(config?.illustration)}
      alt={config?.title ?? ''}
      size={config?.mediaSize ?? defaultSize}
      aspect={config?.mediaAspect ?? '4:3'}
    />
  );
}
