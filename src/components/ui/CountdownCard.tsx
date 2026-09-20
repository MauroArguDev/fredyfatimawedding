import type { ReactNode } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { dateSectionCopy } from '@/content/dateSection';

const FRAME_IMAGE = '/assets/date-section/marco-de-contador.webp';
const FRAME_IMAGE_WIDTH = 1690;
const FRAME_IMAGE_HEIGHT = 1148;
const UNIT_PAD_LENGTH = 2;
const UNIT_PAD_CHAR = '0';
const DIGIT_TRANSITION_DURATION_S = 0.35;
const DIGIT_OFFSET_PX = 14;

const DIGIT_CLASSES = 'font-sans text-base font-normal tabular-nums text-text-on-dark sm:text-xl';

interface CountdownCardProps {
  target: Date;
}

const UnitTile = ({
  value,
  label,
  fullLabel,
}: {
  value: number;
  label: string;
  fullLabel: string;
}): ReactNode => {
  const shouldReduceMotion = useReducedMotion();
  const formattedValue = String(value).padStart(UNIT_PAD_LENGTH, UNIT_PAD_CHAR);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-invitation-sm bg-surface-dark shadow-md sm:size-14">
        {shouldReduceMotion ? (
          <p className={DIGIT_CLASSES}>{formattedValue}</p>
        ) : (
          <AnimatePresence initial={false}>
            <m.p
              key={formattedValue}
              className={`absolute inset-0 flex items-center justify-center ${DIGIT_CLASSES}`}
              initial={{ y: DIGIT_OFFSET_PX, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -DIGIT_OFFSET_PX, opacity: 0 }}
              transition={{ duration: DIGIT_TRANSITION_DURATION_S, ease: 'easeOut' }}
            >
              {formattedValue}
            </m.p>
          </AnimatePresence>
        )}
      </div>
      <p className="text-lg font-bold text-text-body">
        <span aria-hidden="true">{label}</span>
        <span className="sr-only">{fullLabel}</span>
      </p>
    </div>
  );
};

const UnitSeparator = (): ReactNode => (
  <span aria-hidden="true" className="pb-6 text-xl font-normal text-text-on-dark">
    :
  </span>
);

export const CountdownCard = ({ target }: CountdownCardProps): ReactNode => {
  const breakdown = useCountdown(target);
  const units = dateSectionCopy.countdownUnits;

  return (
    <div className="relative -mx-6 w-[calc(100%+3rem)]">
      <img
        src={FRAME_IMAGE}
        alt=""
        aria-hidden="true"
        width={FRAME_IMAGE_WIDTH}
        height={FRAME_IMAGE_HEIGHT}
        className="w-full"
      />
      <div className="absolute inset-x-[11%] inset-y-[26%] flex items-center justify-center rounded-[24px] bg-surface-sage shadow-[0_10px_14px_0_rgba(0,0,0,0.3)]">
        {breakdown.isPast ? (
          <p className="text-center font-script text-3xl text-text-body">
            {dateSectionCopy.countdownClosedMessage}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <UnitTile value={breakdown.days} label={units.days.label} fullLabel={units.days.full} />
            <UnitSeparator />
            <UnitTile
              value={breakdown.hours}
              label={units.hours.label}
              fullLabel={units.hours.full}
            />
            <UnitSeparator />
            <UnitTile
              value={breakdown.minutes}
              label={units.minutes.label}
              fullLabel={units.minutes.full}
            />
            <UnitSeparator />
            <UnitTile
              value={breakdown.seconds}
              label={units.seconds.label}
              fullLabel={units.seconds.full}
            />
          </div>
        )}
      </div>
    </div>
  );
};
