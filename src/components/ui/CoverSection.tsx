import type { ReactNode } from 'react';
import { FloralOrnament } from '@/components/ui/FloralOrnament';
import { coverCopy } from '@/content/cover';

const COVER_PHOTO = '/assets/cover/portada.webp';
const COVER_PHOTO_WIDTH = 900;
const COVER_PHOTO_HEIGHT = 1200;
const FLOWER_ORNAMENT = '/assets/ornaments/flores-encabezado.webp';
const COVER_VIGNETTE = [
  'linear-gradient(to bottom,',
  'var(--color-bg-hero) 0%,',
  'transparent 40%,',
  'transparent 60%,',
  'var(--color-bg-hero) 100%)',
].join(' ');

export const CoverSection = (): ReactNode => {
  return (
    <section id="cover" className="w-full">
      <div className="relative aspect-[885/1280] w-full overflow-hidden">
        <img
          src={COVER_PHOTO}
          alt=""
          width={COVER_PHOTO_WIDTH}
          height={COVER_PHOTO_HEIGHT}
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: COVER_VIGNETTE }}
        />
        <h1 className="absolute inset-x-0 top-1/4 -translate-y-1/2 text-center font-script text-[49px] text-text-hero [text-shadow:3px_3px_3px_rgba(0,0,0,0.75)]">
          {coverCopy.names}
        </h1>
      </div>
      <div className="flex items-start justify-center">
        <FloralOrnament src={FLOWER_ORNAMENT} className="flex-1" />
        <div aria-hidden="true" className="w-[49px] shrink-0" />
        <FloralOrnament src={FLOWER_ORNAMENT} className="flex-1 -scale-x-100" />
      </div>
    </section>
  );
};
