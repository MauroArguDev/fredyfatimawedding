const DAYS_PER_WEEK = 7;
const FIRST_DAY_OF_MONTH = 1;
const LAST_DAY_OF_PREVIOUS_MONTH_OFFSET = 0;

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const MONTH_ABBREVIATION_LENGTH = 3;
const TWO_DIGIT_PAD_LENGTH = 2;
const ZERO_PAD_CHAR = '0';

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
}

const getMonthName = (monthIndex: number): string => MONTH_NAMES[monthIndex] ?? '';

export const buildMonthGrid = (year: number, monthIndex: number): CalendarDay[] => {
  const firstWeekday = new Date(year, monthIndex, FIRST_DAY_OF_MONTH).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, LAST_DAY_OF_PREVIOUS_MONTH_OFFSET).getDate();
  const daysInPreviousMonth = new Date(
    year,
    monthIndex,
    LAST_DAY_OF_PREVIOUS_MONTH_OFFSET,
  ).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / DAYS_PER_WEEK) * DAYS_PER_WEEK;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstWeekday + FIRST_DAY_OF_MONTH;

    if (dayOffset < FIRST_DAY_OF_MONTH) {
      return { date: daysInPreviousMonth + dayOffset, isCurrentMonth: false };
    }

    if (dayOffset > daysInMonth) {
      return { date: dayOffset - daysInMonth, isCurrentMonth: false };
    }

    return { date: dayOffset, isCurrentMonth: true };
  });
};

export const formatCalendarMonthLabel = (date: Date): string => {
  const monthName = getMonthName(date.getMonth());
  const year = date.getFullYear().toLocaleString('en-US');
  return `${monthName} ${year}.`;
};

export const formatCalendarNoteDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(TWO_DIGIT_PAD_LENGTH, ZERO_PAD_CHAR);
  const monthAbbreviation = getMonthName(date.getMonth()).slice(0, MONTH_ABBREVIATION_LENGTH);
  const year = String(date.getFullYear());
  return `${day}/${monthAbbreviation}./${year}`;
};

const HOUR_12_MODULUS = 12;

export const formatCalendarNoteTime = (date: Date): string => {
  const hours24 = date.getHours();
  const period = hours24 < HOUR_12_MODULUS ? 'a.m.' : 'p.m.';
  const hours12 = String(
    hours24 % HOUR_12_MODULUS === 0 ? HOUR_12_MODULUS : hours24 % HOUR_12_MODULUS,
  );
  const minutes = String(date.getMinutes()).padStart(TWO_DIGIT_PAD_LENGTH, ZERO_PAD_CHAR);
  return `${hours12}:${minutes} ${period}`;
};
