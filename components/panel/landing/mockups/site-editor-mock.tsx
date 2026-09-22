import Image from 'next/image';

import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.features.editor;

const SITE_EDITOR_MD = '/landing/site-editor-md.png';
const SITE_EDITOR_LG = '/landing/site-editor-lg.png';

export function SiteEditorMock() {
  return (
    <MockFrame title={M.title} className="shadow-lp-frame w-full max-w-full rounded-[20px]">
      <Image
        src={SITE_EDITOR_MD}
        alt={M.title}
        width={1024}
        height={877}
        className="h-auto w-full max-w-full lg:hidden"
        sizes="(max-width: 1023px) 100vw, 0px"
      />
      <Image
        src={SITE_EDITOR_LG}
        alt={M.title}
        width={1024}
        height={528}
        className="hidden h-auto w-full max-w-full lg:block"
        sizes="(min-width: 1024px) min(780px, 50vw), 0px"
      />
    </MockFrame>
  );
}
