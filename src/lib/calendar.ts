const CALENDAR_TIME_ZONE = 'America/El_Salvador';

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
const HOUR_12_MODULUS = 12;

interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}

const CALENDAR_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: CALENDAR_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

const getCalendarParts = (date: Date): CalendarDateParts => {
  const parts = CALENDAR_PARTS_FORMATTER.formatToParts(date);
  const findPart = (type: string): number => {
    const part = parts.find((candidate) => candidate.type === type);
    return part ? Number(part.value) : 0;
  };

  return {
    year: findPart('year'),
    month: findPart('month'),
    day: findPart('day'),
    hours: findPart('hour'),
    minutes: findPart('minute'),
  };
};

const getMonthName = (monthIndex: number): string => MONTH_NAMES[monthIndex] ?? '';

export const getCalendarDay = (date: Date): number => getCalendarParts(date).day;

export const formatCalendarMonthLabel = (date: Date): string => {
  const { month, year } = getCalendarParts(date);
  const monthName = getMonthName(month - 1);
  return `${monthName} ${year.toLocaleString('en-US')}.`;
};

export const formatCalendarNoteDate = (date: Date): string => {
  const { day, month, year } = getCalendarParts(date);
  const dayLabel = String(day).padStart(TWO_DIGIT_PAD_LENGTH, ZERO_PAD_CHAR);
  const monthAbbreviation = getMonthName(month - 1).slice(0, MONTH_ABBREVIATION_LENGTH);
  return `${dayLabel}/${monthAbbreviation}./${String(year)}`;
};

export const formatCalendarNoteTime = (date: Date): string => {
  const { hours: hours24, minutes } = getCalendarParts(date);
  const period = hours24 < HOUR_12_MODULUS ? 'a.m.' : 'p.m.';
  const hours12 = String(
    hours24 % HOUR_12_MODULUS === 0 ? HOUR_12_MODULUS : hours24 % HOUR_12_MODULUS,
  );
  const minutesLabel = String(minutes).padStart(TWO_DIGIT_PAD_LENGTH, ZERO_PAD_CHAR);
  return `${hours12}:${minutesLabel} ${period}`;
};
