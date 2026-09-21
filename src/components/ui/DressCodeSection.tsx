import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { dressCodeCopy } from '@/content/dressCode';

const TITLE_IMAGE = '/assets/dress-code/title.webp';
const TITLE_WIDTH = 1730;
const TITLE_HEIGHT = 450;
const COUPLE_IMAGE = '/assets/dress-code/couple.webp';
const COUPLE_WIDTH = 1400;
const COUPLE_HEIGHT = 1149;
const CORNER_LEFT_IMAGE = '/assets/dress-code/corner-left.webp';
const CORNER_RIGHT_IMAGE = '/assets/dress-code/corner-right.webp';
const CORNER_WIDTH = 200;
const CORNER_HEIGHT = 180;
const AVOID_COLORS_WOMEN_IMAGE = '/assets/dress-code/avoid-colors-women.webp';
const AVOID_COLORS_MEN_IMAGE = '/assets/dress-code/avoid-colors-men.webp';
const AVOID_COLORS_WIDTH = 1000;
const AVOID_COLORS_HEIGHT = 254;

const GenderBlock = ({
  heading,
  avoidNote,
  avoidColorsImage,
  avoidColorsImageAlt,
}: {
  heading: string;
  avoidNote: string;
  avoidColorsImage: string;
  avoidColorsImageAlt: string;
}): ReactNode => (
  <div className="mt-10">
    <div className="relative -mx-6 flex min-h-24 w-[calc(100%+3rem)] items-center justify-center">
      <img
        src={CORNER_LEFT_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={CORNER_WIDTH}
        height={CORNER_HEIGHT}
        className="absolute left-0 w-1/4 max-w-28"
      />
      <p className="font-script text-3xl text-text-heading">{heading}</p>
      <img
        src={CORNER_RIGHT_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={CORNER_WIDTH}
        height={CORNER_HEIGHT}
        className="absolute right-0 w-1/4 max-w-28"
      />
    </div>
    <p className="mt-4">{avoidNote}</p>
    <img
      src={avoidColorsImage}
      alt={avoidColorsImageAlt}
      loading="lazy"
      width={AVOID_COLORS_WIDTH}
      height={AVOID_COLORS_HEIGHT}
      className="mx-auto mt-4 w-full max-w-[244px]"
    />
  </div>
);

export const DressCodeSection = (): ReactNode => {
  return (
    <Section id="dress-code" className="text-center text-text-body">
      <img
        src={TITLE_IMAGE}
        alt={dressCodeCopy.titleAlt}
        width={TITLE_WIDTH}
        height={TITLE_HEIGHT}
        className="mx-auto w-full max-w-sm"
      />
      <img
        src={COUPLE_IMAGE}
        alt={dressCodeCopy.coupleIllustrationAlt}
        loading="lazy"
        width={COUPLE_WIDTH}
        height={COUPLE_HEIGHT}
        className="mx-auto mt-6 w-full max-w-[342px]"
      />
      <p className="mx-auto mt-6 max-w-sm rounded-invitation-sm border border-envelope-text/40 px-4 py-3 whitespace-pre-line">
        {dressCodeCopy.note}
      </p>
      <p className="mt-8">{dressCodeCopy.avoidColorsIntro}</p>
      <GenderBlock
        heading={dressCodeCopy.women.heading}
        avoidNote={dressCodeCopy.women.avoidNote}
        avoidColorsImage={AVOID_COLORS_WOMEN_IMAGE}
        avoidColorsImageAlt={dressCodeCopy.women.avoidColorsImageAlt}
      />
      <GenderBlock
        heading={dressCodeCopy.men.heading}
        avoidNote={dressCodeCopy.men.avoidNote}
        avoidColorsImage={AVOID_COLORS_MEN_IMAGE}
        avoidColorsImageAlt={dressCodeCopy.men.avoidColorsImageAlt}
      />
    </Section>
  );
};
