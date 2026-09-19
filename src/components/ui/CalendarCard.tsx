import type { ReactNode } from 'react';
import {
  formatCalendarMonthLabel,
  formatCalendarNoteDate,
  formatCalendarNoteTime,
} from '@/lib/calendar';
import { dateSectionCopy } from '@/content/dateSection';

const CALENDAR_IMAGE = '/assets/date-section/calendario-con-fecha.webp';
const CALENDAR_IMAGE_WIDTH = 1610;
const CALENDAR_IMAGE_HEIGHT = 1837;

interface CalendarCardProps {
  date: Date;
}

export const CalendarCard = ({ date }: CalendarCardProps): ReactNode => {
  const alt = dateSectionCopy.calendarImageAlt(
    formatCalendarMonthLabel(date),
    date.getDate(),
    formatCalendarNoteDate(date),
    formatCalendarNoteTime(date),
  );

  return (
    <img
      src={CALENDAR_IMAGE}
      alt={alt}
      width={CALENDAR_IMAGE_WIDTH}
      height={CALENDAR_IMAGE_HEIGHT}
      className="w-full rounded-[24px] shadow-lg"
    />
  );
};
