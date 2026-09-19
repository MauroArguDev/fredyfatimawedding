import type { ReactNode } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { FloralOrnament } from '@/components/ui/FloralOrnament';
import { dateSectionCopy } from '@/content/dateSection';

const UNIT_PAD_LENGTH = 2;
const UNIT_PAD_CHAR = '0';

interface CountdownCardProps {
  target: Date;
}

const UnitTile = ({ value, label }: { value: number; label: string }): ReactNode => (
  <div>
    <p className="font-sans text-3xl font-bold tabular-nums">
      {String(value).padStart(UNIT_PAD_LENGTH, UNIT_PAD_CHAR)}
    </p>
    <p className="text-xs">{label}</p>
  </div>
);

export const CountdownCard = ({ target }: CountdownCardProps): ReactNode => {
  const breakdown = useCountdown(target);
  const units = dateSectionCopy.countdownUnits;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-surface-sage px-6 py-10 text-text-on-sage shadow-lg">
      <FloralOrnament
        src="/assets/ornaments/flores-encabezado.webp"
        className="pointer-events-none absolute -top-4 -right-4 w-28 opacity-70"
      />
      <FloralOrnament
        src="/assets/ornaments/flores-encabezado.webp"
        className="pointer-events-none absolute -bottom-4 -left-4 w-28 rotate-180 opacity-70"
      />
      {breakdown.isPast ? (
        <p className="relative text-center font-script text-2xl">
          {dateSectionCopy.countdownClosedMessage}
        </p>
      ) : (
        <div className="relative grid grid-cols-4 gap-3 text-center">
          <UnitTile value={breakdown.days} label={units.days} />
          <UnitTile value={breakdown.hours} label={units.hours} />
          <UnitTile value={breakdown.minutes} label={units.minutes} />
          <UnitTile value={breakdown.seconds} label={units.seconds} />
        </div>
      )}
    </div>
  );
};
