import { describe, expect, it } from 'vitest';
import { mapCsvToGuestInputs, mapHumanCsvToGuestInputs, partitionNewGuests } from './guestImport';

const HEADER = ['firstName', 'lastName', 'titleLabel', 'guestLimit', 'phone'];
const HUMAN_HEADER = ['Nombre', 'Apellido', 'Texto en sobre', 'Cupo de invitados', 'Teléfono'];

describe('mapCsvToGuestInputs', () => {
  it('mapsValidRowsIntoGuestInputs', () => {
    const result = mapCsvToGuestInputs([
      HEADER,
      ['Orlando', 'Martínez', 'Tío Orlando y Familia.', '3', '+50370000000'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.guests).toEqual([
      {
        firstName: 'Orlando',
        lastName: 'Martínez',
        titleLabel: 'Tío Orlando y Familia.',
        guestLimit: 3,
        phone: '+50370000000',
      },
    ]);
  });

  it('treatsEmptyLastNameAndTitleLabelAsNull', () => {
    const result = mapCsvToGuestInputs([HEADER, ['Orlando', '', '', '1', '+50370000000']]);

    expect(result.errors).toEqual([]);
    expect(result.guests[0]?.lastName).toBeNull();
    expect(result.guests[0]?.titleLabel).toBeNull();
  });

  it('preservesAccentsAndEneInImportedNames', () => {
    const result = mapCsvToGuestInputs([HEADER, ['Íñigo', 'Peña', '', '1', '+50370000000']]);

    expect(result.guests[0]?.firstName).toBe('Íñigo');
    expect(result.guests[0]?.lastName).toBe('Peña');
  });

  it('abortsTheWholeImportReportingRowAndErrorWhenGuestLimitIsZero', () => {
    const result = mapCsvToGuestInputs([
      HEADER,
      ['Orlando', '', '', '3', '+50370000000'],
      ['Fátima', '', '', '0', '+50370000001'],
    ]);

    expect(result.guests).toEqual([]);
    expect(result.errors).toEqual([{ row: 3, message: expect.any(String) }]);
  });

  it('abortsWithoutWritingAnyGuestWhenPhoneIsMalformed', () => {
    const result = mapCsvToGuestInputs([HEADER, ['Orlando', '', '', '3', 'not-a-phone']]);

    expect(result.guests).toEqual([]);
    expect(result.errors[0]?.row).toBe(2);
  });

  it('rejectsAHeaderThatDoesNotMatchTheExpectedColumns', () => {
    const result = mapCsvToGuestInputs([
      ['firstName', 'phone'],
      ['Orlando', '+50370000000'],
    ]);

    expect(result.guests).toEqual([]);
    expect(result.errors).toEqual([
      { row: 1, message: expect.stringContaining('Expected header') },
    ]);
  });

  it('reportsAnEmptyFileAsAnError', () => {
    expect(mapCsvToGuestInputs([]).errors).toEqual([{ row: 0, message: 'CSV file is empty' }]);
  });
});

describe('mapHumanCsvToGuestInputs', () => {
  it('mapsValidRowsFromTheHumanHeaderAndNormalizesThePhone', () => {
    const result = mapHumanCsvToGuestInputs([
      HUMAN_HEADER,
      ['Orlando', 'Martínez', 'Tío Orlando y Familia.', '3', '7000-0000'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.guests).toEqual([
      {
        firstName: 'Orlando',
        lastName: 'Martínez',
        titleLabel: 'Tío Orlando y Familia.',
        guestLimit: 3,
        phone: '+50370000000',
      },
    ]);
  });

  it('rejectsTheMachineReadableEnglishHeaderBecauseItExpectsTheHumanOne', () => {
    const result = mapHumanCsvToGuestInputs([HEADER, ['Orlando', '', '', '3', '+50370000000']]);

    expect(result.guests).toEqual([]);
    expect(result.errors[0]?.message).toContain('Expected header');
  });

  it('abortsWithoutWritingAnyGuestWhenARowFailsValidation', () => {
    const result = mapHumanCsvToGuestInputs([HUMAN_HEADER, ['Orlando', '', '', '', '']]);

    expect(result.guests).toEqual([]);
    expect(result.errors[0]?.row).toBe(2);
  });
});

describe('partitionNewGuests', () => {
  const orlando = {
    firstName: 'Orlando',
    lastName: null,
    titleLabel: null,
    guestLimit: 3,
    phone: '+50370000000',
  };
  const fatima = { ...orlando, firstName: 'Fátima', phone: '+50370000001' };

  it('keepsGuestsWhosePhoneIsNotAlreadyInFirestore', () => {
    expect(partitionNewGuests([orlando, fatima], new Set())).toEqual({
      toCreate: [orlando, fatima],
      alreadyPresent: [],
    });
  });

  it('skipsGuestsWhosePhoneAlreadyExistsSoRerunningDoesNotDuplicate', () => {
    expect(partitionNewGuests([orlando, fatima], new Set([orlando.phone]))).toEqual({
      toCreate: [fatima],
      alreadyPresent: [orlando],
    });
  });
});
