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

const getMonthName = (monthIndex: number): string => MONTH_NAMES[monthIndex] ?? '';

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
