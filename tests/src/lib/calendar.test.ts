import { describe, expect, it } from 'vitest';
import {
  formatCalendarMonthLabel,
  formatCalendarNoteDate,
  formatCalendarNoteTime,
  getCalendarDay,
} from '@/lib/calendar';

describe('formatCalendarMonthLabel', () => {
  it('formatsTheMonthWithASpanishNameAndAThousandsSeparatedYear', () => {
    expect(formatCalendarMonthLabel(new Date('2026-12-20T16:30:00-06:00'))).toBe(
      'Diciembre 2,026.',
    );
  });

  it('readsTheMonthInElSalvadorTimeEvenWhenThatInstantIsAlreadyNextMonthInUtc', () => {
    expect(formatCalendarMonthLabel(new Date('2027-01-01T04:00:00Z'))).toBe('Diciembre 2,026.');
  });
});

describe('formatCalendarNoteDate', () => {
  it('formatsAsDayMonthAbbreviationYear', () => {
    expect(formatCalendarNoteDate(new Date('2026-12-20T16:30:00-06:00'))).toBe('20/Dic./2026');
  });

  it('padsSingleDigitDaysWithALeadingZero', () => {
    expect(formatCalendarNoteDate(new Date('2026-12-05T16:30:00-06:00'))).toBe('05/Dic./2026');
  });
});

describe('formatCalendarNoteTime', () => {
  it('formatsAfternoonHoursAsPM', () => {
    expect(formatCalendarNoteTime(new Date('2026-12-20T16:30:00-06:00'))).toBe('4:30 p.m.');
  });

  it('formatsMorningHoursAsAM', () => {
    expect(formatCalendarNoteTime(new Date('2026-12-20T09:05:00-06:00'))).toBe('9:05 a.m.');
  });

  it('formatsNoonAsTwelvePM', () => {
    expect(formatCalendarNoteTime(new Date('2026-12-20T12:00:00-06:00'))).toBe('12:00 p.m.');
  });

  it('formatsMidnightAsTwelveAM', () => {
    expect(formatCalendarNoteTime(new Date('2026-12-20T00:00:00-06:00'))).toBe('12:00 a.m.');
  });
});

describe('getCalendarDay', () => {
  it('readsTheDayOfMonthInElSalvadorTime', () => {
    expect(getCalendarDay(new Date('2026-12-20T16:30:00-06:00'))).toBe(20);
  });

  it('readsTheDayOfMonthInElSalvadorTimeEvenWhenThatInstantIsAlreadyTheNextDayInUtc', () => {
    expect(getCalendarDay(new Date('2027-01-01T04:00:00Z'))).toBe(31);
  });
});
