import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { aboutUsCopy } from '@/content/aboutUs';

const COLLAGE_IMAGE = '/assets/about-us/collage.webp';
const COLLAGE_WIDTH = 1770;
const COLLAGE_HEIGHT = 2110;
const QUOTE_BLUSH = [
  'radial-gradient(ellipse 30% 22% at 50% 50%,',
  'var(--color-accent-coral) 0%,',
  'transparent 100%)',
].join(' ');

export const AboutUsSection = (): ReactNode => {
  return (
    <Section id="about-us" className="text-center text-text-body">
      <img
        src={COLLAGE_IMAGE}
        alt={aboutUsCopy.collageAlt}
        loading="lazy"
        width={COLLAGE_WIDTH}
        height={COLLAGE_HEIGHT}
        className="-mx-6 w-[calc(100%+3rem)]"
      />
      <div className="relative mt-8 py-8" style={{ background: QUOTE_BLUSH }}>
        <div className="mx-auto h-px w-2/3 bg-accent-terracotta/50" />
        <p className="mt-4 font-normal text-accent-terracotta">
          {aboutUsCopy.quote.before}
          <span className="font-script text-3xl font-semibold">{aboutUsCopy.quote.emphasis}</span>
          {aboutUsCopy.quote.middle}
          <span aria-hidden="true">&quot;</span>
          <span className="font-script text-3xl font-semibold">{aboutUsCopy.quote.vow}</span>
          <span aria-hidden="true">&quot;</span>
        </p>
        <div className="mx-auto mt-4 h-px w-2/3 bg-accent-terracotta/50" />
      </div>
    </Section>
  );
};
