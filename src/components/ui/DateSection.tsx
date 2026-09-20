import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { CalendarCard } from '@/components/ui/CalendarCard';
import { CountdownCard } from '@/components/ui/CountdownCard';
import { dateSectionCopy } from '@/content/dateSection';
import { weddingDate } from '@/content/weddingDate';

const HEADING_IMAGE = '/assets/headings/nos-vamos-a-casar.svg';

export const DateSection = (): ReactNode => {
  return (
    <Section id="date" className="text-center text-text-body">
      <img
        src={HEADING_IMAGE}
        alt={dateSectionCopy.headingAlt}
        className="mx-auto w-full max-w-md"
      />
      <p className="mt-4">{dateSectionCopy.subtitle}</p>
      <div className="mt-8">
        <CalendarCard />
      </div>
      <p className="mt-12">{dateSectionCopy.countdownIntro}</p>
      <div className="mt-4">
        <CountdownCard target={weddingDate} />
      </div>
    </Section>
  );
};
