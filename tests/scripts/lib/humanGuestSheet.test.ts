import { describe, expect, it } from 'vitest';
import {
  HUMAN_SHEET_HEADER,
  normalizeHumanGuestSheet,
  normalizePhone,
} from '../../../scripts/lib/humanGuestSheet';

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

  it('prependsAPlusToAnElevenDigitNumberStartingWithOneAsANorthAmericanNumber', () => {
    expect(normalizePhone('15712773066')).toBe('+15712773066');
  });

  it('stripsSpacesFromANorthAmericanNumberBeforeDetectingIt', () => {
    expect(normalizePhone('1 571 277 3066')).toBe('+15712773066');
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

  it('acceptsTheLegacyTratoParaElSobreHeaderFromFilesCreatedBeforeTheRename', () => {
    const result = normalizeHumanGuestSheet([
      ['Nombre', 'Apellido', 'Trato para el sobre', 'Cupo de invitados', 'Teléfono'],
      ['Orlando', 'Martínez', 'Tío Orlando y Familia.', '3', '7000-0000'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      ['Orlando', 'Martínez', 'Tío Orlando y Familia.', '3', '+50370000000'],
    ]);
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
