import type { ReactNode } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { FloralOrnament } from '@/components/ui/FloralOrnament';
import { dateSectionCopy } from '@/content/dateSection';

const FLOWER_ORNAMENT = '/assets/ornaments/flores-encabezado.webp';
const UNIT_PAD_LENGTH = 2;
const UNIT_PAD_CHAR = '0';

interface CountdownCardProps {
  target: Date;
}

const UnitTile = ({ value, label }: { value: number; label: string }): ReactNode => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex size-14 items-center justify-center rounded-invitation-sm bg-surface-dark sm:size-16">
      <p className="font-sans text-xl font-bold tabular-nums text-text-on-dark sm:text-2xl">
        {String(value).padStart(UNIT_PAD_LENGTH, UNIT_PAD_CHAR)}
      </p>
    </div>
    <p className="text-xs text-text-on-sage">{label}</p>
  </div>
);

const UnitSeparator = (): ReactNode => (
  <span aria-hidden="true" className="pb-6 text-xl font-bold text-text-on-sage">
    :
  </span>
);

export const CountdownCard = ({ target }: CountdownCardProps): ReactNode => {
  const breakdown = useCountdown(target);
  const units = dateSectionCopy.countdownUnits;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-surface-sage px-4 py-8 shadow-lg">
      <FloralOrnament
        src={FLOWER_ORNAMENT}
        className="pointer-events-none absolute -top-4 -right-4 w-28 opacity-70"
      />
      <FloralOrnament
        src={FLOWER_ORNAMENT}
        className="pointer-events-none absolute -bottom-4 -left-4 w-28 rotate-180 opacity-70"
      />
      {breakdown.isPast ? (
        <p className="relative text-center font-script text-2xl text-text-on-sage">
          {dateSectionCopy.countdownClosedMessage}
        </p>
      ) : (
        <div className="relative flex items-center justify-center gap-2">
          <UnitTile value={breakdown.days} label={units.days} />
          <UnitSeparator />
          <UnitTile value={breakdown.hours} label={units.hours} />
          <UnitSeparator />
          <UnitTile value={breakdown.minutes} label={units.minutes} />
          <UnitSeparator />
          <UnitTile value={breakdown.seconds} label={units.seconds} />
        </div>
      )}
    </div>
  );
};
