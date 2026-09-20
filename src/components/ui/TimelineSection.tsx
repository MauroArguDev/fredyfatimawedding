import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { timelineCopy } from '@/content/timeline';

const TITLE_IMAGE = '/assets/timeline/title.webp';
const TITLE_WIDTH = 1650;
const TITLE_HEIGHT = 302;
const FULL_IMAGE = '/assets/timeline/full.webp';
const FULL_WIDTH = 1730;
const FULL_HEIGHT = 3003;

export const TimelineSection = (): ReactNode => {
  return (
    <Section id="timeline" className="text-center text-text-body">
      <img
        src={TITLE_IMAGE}
        alt={timelineCopy.titleAlt}
        width={TITLE_WIDTH}
        height={TITLE_HEIGHT}
      />
      <img
        src={FULL_IMAGE}
        alt={timelineCopy.fullImageAlt}
        loading="lazy"
        width={FULL_WIDTH}
        height={FULL_HEIGHT}
        className="mt-6 w-full"
      />
    </Section>
  );
};
