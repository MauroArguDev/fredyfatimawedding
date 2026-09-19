import { describe, expect, it } from 'vitest';
import {
  buildMonthGrid,
  formatCalendarMonthLabel,
  formatCalendarNoteDate,
  formatCalendarNoteTime,
} from '@/lib/calendar';

describe('buildMonthGrid', () => {
  it('padsDecember2026WithNovemberAndJanuaryDaysToCompleteFullWeeks', () => {
    const grid = buildMonthGrid(2026, 11);

    expect(grid[0]).toEqual({ date: 29, isCurrentMonth: false });
    expect(grid[1]).toEqual({ date: 30, isCurrentMonth: false });
    expect(grid[2]).toEqual({ date: 1, isCurrentMonth: true });
    expect(grid.at(-1)).toEqual({ date: 2, isCurrentMonth: false });
  });

  it('marksTheWeddingDayAsPartOfTheCurrentMonth', () => {
    const grid = buildMonthGrid(2026, 11);

    const weddingDay = grid.find((cell) => cell.isCurrentMonth && cell.date === 20);
    expect(weddingDay).toBeDefined();
  });

  it('returnsAWholeNumberOfWeeks', () => {
    const grid = buildMonthGrid(2026, 11);

    expect(grid.length % 7).toBe(0);
  });
});

describe('formatCalendarMonthLabel', () => {
  it('formatsTheMonthWithASpanishNameAndAThousandsSeparatedYear', () => {
    expect(formatCalendarMonthLabel(new Date(2026, 11, 20))).toBe('Diciembre 2,026.');
  });
});

describe('formatCalendarNoteDate', () => {
  it('formatsAsDayMonthAbbreviationYear', () => {
    expect(formatCalendarNoteDate(new Date(2026, 11, 20))).toBe('20/Dic./2026');
  });

  it('padsSingleDigitDaysWithALeadingZero', () => {
    expect(formatCalendarNoteDate(new Date(2026, 11, 5))).toBe('05/Dic./2026');
  });
});

describe('formatCalendarNoteTime', () => {
  it('formatsAfternoonHoursAsPM', () => {
    expect(formatCalendarNoteTime(new Date(2026, 11, 20, 16, 30))).toBe('4:30 p.m.');
  });

  it('formatsMorningHoursAsAM', () => {
    expect(formatCalendarNoteTime(new Date(2026, 11, 20, 9, 5))).toBe('9:05 a.m.');
  });

  it('formatsNoonAsTwelvePM', () => {
    expect(formatCalendarNoteTime(new Date(2026, 11, 20, 12, 0))).toBe('12:00 p.m.');
  });

  it('formatsMidnightAsTwelveAM', () => {
    expect(formatCalendarNoteTime(new Date(2026, 11, 20, 0, 0))).toBe('12:00 a.m.');
  });
});
