import type { ReactNode } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { dateSectionCopy } from '@/content/dateSection';

const FRAME_IMAGE = '/assets/date-section/marco-de-contador.webp';
const FRAME_IMAGE_WIDTH = 1690;
const FRAME_IMAGE_HEIGHT = 1148;
const UNIT_PAD_LENGTH = 2;
const UNIT_PAD_CHAR = '0';

interface CountdownCardProps {
  target: Date;
}

const UnitTile = ({ value, label }: { value: number; label: string }): ReactNode => (
  <div>
    <p className="font-sans text-xl font-bold tabular-nums text-text-body sm:text-3xl">
      {String(value).padStart(UNIT_PAD_LENGTH, UNIT_PAD_CHAR)}
    </p>
    <p className="text-[11px] text-text-body sm:text-xs">{label}</p>
  </div>
);

export const CountdownCard = ({ target }: CountdownCardProps): ReactNode => {
  const breakdown = useCountdown(target);
  const units = dateSectionCopy.countdownUnits;

  return (
    <div className="relative w-full">
      <img
        src={FRAME_IMAGE}
        alt=""
        aria-hidden="true"
        width={FRAME_IMAGE_WIDTH}
        height={FRAME_IMAGE_HEIGHT}
        className="w-full"
      />
      <div className="absolute inset-x-[12%] inset-y-[30%] flex items-center justify-center">
        {breakdown.isPast ? (
          <p className="text-center font-script text-2xl text-text-body">
            {dateSectionCopy.countdownClosedMessage}
          </p>
        ) : (
          <div className="grid w-full grid-cols-4 gap-1 text-center">
            <UnitTile value={breakdown.days} label={units.days} />
            <UnitTile value={breakdown.hours} label={units.hours} />
            <UnitTile value={breakdown.minutes} label={units.minutes} />
            <UnitTile value={breakdown.seconds} label={units.seconds} />
          </div>
        )}
      </div>
    </div>
  );
};
