import { describe, expect, it } from 'vitest';
import { HUMAN_SHEET_HEADER, normalizeHumanGuestSheet, normalizePhone } from './humanGuestSheet';

describe('normalizePhone', () => {
  it('prependsTheElSalvadorCountryCodeToAnEightDigitLocalNumber', () => {
    expect(normalizePhone('7000-0000')).toBe('+50370000000');
  });

  it('stripsSpacesParenthesesAndDots', () => {
    expect(normalizePhone('7000 0000')).toBe('+50370000000');
  });

  it('leavesANumberThatAlreadyHasAPlusUntouchedBesidesCleanup', () => {
    expect(normalizePhone('+503 7000-0000')).toBe('+50370000000');
  });

  it('convertsTheInternationalTrunkPrefixZeroZeroIntoAPlus', () => {
    expect(normalizePhone('00503 7000 0000')).toBe('+50370000000');
  });

  it('passesThroughAnUnrecognizableNumberUnchangedForDownstreamValidationToCatch', () => {
    expect(normalizePhone('abc')).toBe('');
    expect(normalizePhone('123')).toBe('123');
  });
});

describe('normalizeHumanGuestSheet', () => {
  it('mapsSpanishHeaderRowsIntoTheMachineColumnOrder', () => {
    const result = normalizeHumanGuestSheet([
      [...HUMAN_SHEET_HEADER],
      ['Orlando', 'Martínez', 'Tío Orlando y Familia.', '3', '7000-0000'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      ['Orlando', 'Martínez', 'Tío Orlando y Familia.', '3', '+50370000000'],
    ]);
  });

  it('preservesAccentsAndEneWhileNormalizing', () => {
    const result = normalizeHumanGuestSheet([
      [...HUMAN_SHEET_HEADER],
      ['Íñigo', 'Peña', '', '1', '70000000'],
    ]);

    expect(result.rows[0]?.[0]).toBe('Íñigo');
    expect(result.rows[0]?.[1]).toBe('Peña');
  });

  it('rejectsASheetWithTheWrongHeaderBeforeNormalizingAnyRow', () => {
    const result = normalizeHumanGuestSheet([
      ['Nombre', 'Teléfono'],
      ['Orlando', '70000000'],
    ]);

    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([
      { row: 1, message: expect.stringContaining('Expected header') },
    ]);
  });

  it('reportsAnEmptySheetAsAnError', () => {
    expect(normalizeHumanGuestSheet([]).errors).toEqual([{ row: 0, message: 'Sheet is empty' }]);
  });
});
