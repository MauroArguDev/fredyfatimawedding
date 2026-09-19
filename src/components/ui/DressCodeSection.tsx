import type { ReactNode } from 'react';
import { dressCodeCopy, type DressCodeColor } from '@/content/dressCode';

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

const ColorSwatch = ({ hex, name }: DressCodeColor): ReactNode => (
  <div className="flex w-16 flex-col items-center gap-1">
    <span
      aria-hidden="true"
      className="block size-10 rounded-full border border-envelope-text/20"
      style={{ backgroundColor: hex }}
    />
    <span className="text-xs">{name}</span>
  </div>
);

const GenderBlock = ({
  heading,
  avoidNote,
  colors,
}: {
  heading: string;
  avoidNote: string;
  colors: readonly DressCodeColor[];
}): ReactNode => (
  <div className="mt-10">
    <div className="relative flex min-h-24 items-center justify-center">
      <img
        src={CORNER_LEFT_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={CORNER_WIDTH}
        height={CORNER_HEIGHT}
        className="absolute left-0 w-1/4 max-w-24"
      />
      <p className="font-script text-3xl text-text-heading">{heading}</p>
      <img
        src={CORNER_RIGHT_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={CORNER_WIDTH}
        height={CORNER_HEIGHT}
        className="absolute right-0 w-1/4 max-w-24"
      />
    </div>
    <p className="mt-4">{avoidNote}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      {colors.map((color) => (
        <ColorSwatch key={color.hex} {...color} />
      ))}
    </div>
  </div>
);

export const DressCodeSection = (): ReactNode => {
  return (
    <section id="dress-code" className="w-full px-6 py-10 text-center text-text-body">
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
        className="mx-auto mt-6 w-2/3 max-w-56"
      />
      <p className="mx-auto mt-6 max-w-sm rounded-invitation-sm border border-envelope-text/40 px-4 py-3 whitespace-pre-line">
        {dressCodeCopy.note}
      </p>
      <p className="mt-8">{dressCodeCopy.avoidColorsIntro}</p>
      <GenderBlock
        heading={dressCodeCopy.women.heading}
        avoidNote={dressCodeCopy.women.avoidNote}
        colors={dressCodeCopy.women.colors}
      />
      <GenderBlock
        heading={dressCodeCopy.men.heading}
        avoidNote={dressCodeCopy.men.avoidNote}
        colors={dressCodeCopy.men.colors}
      />
    </section>
  );
};
