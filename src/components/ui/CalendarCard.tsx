import type { ReactNode } from 'react';
import {
  buildMonthGrid,
  formatCalendarMonthLabel,
  formatCalendarNoteDate,
  formatCalendarNoteTime,
  type CalendarDay,
} from '@/lib/calendar';
import { dateSectionCopy } from '@/content/dateSection';

const DAY_PAD_LENGTH = 2;
const DAY_PAD_CHAR = '0';
const NOTE_ROTATION_DEG = -4;

interface CalendarCardProps {
  date: Date;
}

const HeartMarker = (): ReactNode => (
  <svg
    aria-hidden="true"
    viewBox="0 0 40 40"
    className="absolute inset-0 size-full text-surface-sage"
  >
    <path
      d="M20 32C10 25 4 19 4 13.5 4 9 7.5 6 11.5 6c2.6 0 5 1.4 6.5 3.6C19.5 7.4 21.9 6 24.5 6 28.5 6 32 9 32 13.5 32 19 26 25 20 32Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const WeekdayHeader = (): ReactNode => (
  <>
    {dateSectionCopy.weekdayLabels.map((label) => (
      <span key={label} className="text-sm font-semibold">
        {label}
      </span>
    ))}
  </>
);

const DayCell = ({
  cell,
  isWeddingDay,
}: {
  cell: CalendarDay;
  isWeddingDay: boolean;
}): ReactNode => {
  const dayLabel = String(cell.date).padStart(DAY_PAD_LENGTH, DAY_PAD_CHAR);

  if (isWeddingDay) {
    return (
      <span className="relative flex aspect-square items-center justify-center font-bold text-text-hero">
        <HeartMarker />
        <span className="relative">{dayLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={`flex aspect-square items-center justify-center text-sm ${cell.isCurrentMonth ? '' : 'opacity-40'}`}
    >
      {dayLabel}
    </span>
  );
};

const NoteTag = ({ date }: { date: Date }): ReactNode => (
  <div
    className="absolute bottom-0 left-1/2 w-56 -translate-x-1/2 translate-y-1/2 bg-accent-coral px-5 py-3 text-center font-script text-lg text-envelope-text shadow-invitation-badge"
    style={{
      transform: `translate(-50%, 50%) rotate(${String(NOTE_ROTATION_DEG)}deg)`,
      clipPath:
        'polygon(0 0, 100% 0, 100% 82%, 90% 100%, 80% 82%, 70% 100%, 60% 82%, 50% 100%, 40% 82%, 30% 100%, 20% 82%, 10% 100%, 0 82%)',
    }}
  >
    <p>{formatCalendarNoteDate(date)}</p>
    <p>{formatCalendarNoteTime(date)}</p>
  </div>
);

export const CalendarCard = ({ date }: CalendarCardProps): ReactNode => {
  const grid = buildMonthGrid(date.getFullYear(), date.getMonth());
  const weddingDay = date.getDate();

  return (
    <div className="relative rounded-[24px] bg-surface-dark px-6 pt-6 pb-14 text-text-on-dark shadow-lg">
      <p className="text-center font-script text-3xl text-accent-coral">
        {formatCalendarMonthLabel(date)}
      </p>
      <div className="mx-auto mt-2 h-px w-40 bg-accent-coral/60" />
      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
        <WeekdayHeader />
        {grid.map((cell, index) => (
          <DayCell
            key={`${cell.isCurrentMonth ? 'current' : 'adjacent'}-${String(cell.date)}-${String(index)}`}
            cell={cell}
            isWeddingDay={cell.isCurrentMonth && cell.date === weddingDay}
          />
        ))}
      </div>
      <NoteTag date={date} />
    </div>
  );
};
