import type { ReactNode } from 'react';
import {
  formatCalendarMonthLabel,
  formatCalendarNoteDate,
  formatCalendarNoteTime,
  getCalendarDay,
} from '@/lib/calendar';
import { dateSectionCopy } from '@/content/dateSection';
import { weddingDate } from '@/content/weddingDate';

const CALENDAR_IMAGE = '/assets/date-section/calendario-con-fecha.webp';
const CALENDAR_IMAGE_WIDTH = 1610;
const CALENDAR_IMAGE_HEIGHT = 1837;

export const CalendarCard = (): ReactNode => {
  const alt = dateSectionCopy.calendarImageAlt(
    formatCalendarMonthLabel(weddingDate),
    getCalendarDay(weddingDate),
    formatCalendarNoteDate(weddingDate),
    formatCalendarNoteTime(weddingDate),
  );

  return (
    <img
      src={CALENDAR_IMAGE}
      alt={alt}
      width={CALENDAR_IMAGE_WIDTH}
      height={CALENDAR_IMAGE_HEIGHT}
      className="w-full"
    />
  );
};
