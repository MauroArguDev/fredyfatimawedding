import { validateExactHeader } from './rowValidation.js';
import type { RowError } from './rowValidation.js';

export const HUMAN_SHEET_HEADER = [
  'Nombre',
  'Apellido',
  'Texto en sobre',
  'Cupo de invitados',
  'Teléfono',
] as const;

const EL_SALVADOR_COUNTRY_CODE = '+503';
const LOCAL_PHONE_DIGIT_COUNT = 8;
const INTERNATIONAL_TRUNK_PREFIX = '00';

export interface NormalizeResult {
  rows: string[][];
  errors: RowError[];
}

export function normalizePhone(rawValue: string): string {
  const digitsAndPlus = rawValue.replace(/[^\d+]/g, '');

  if (digitsAndPlus.startsWith('+')) {
    return digitsAndPlus;
  }

  if (digitsAndPlus.startsWith(INTERNATIONAL_TRUNK_PREFIX)) {
    return `+${digitsAndPlus.slice(INTERNATIONAL_TRUNK_PREFIX.length)}`;
  }

  if (digitsAndPlus.length === LOCAL_PHONE_DIGIT_COUNT) {
    return `${EL_SALVADOR_COUNTRY_CODE}${digitsAndPlus}`;
  }

  return digitsAndPlus;
}

function normalizeRow(row: string[]): string[] {
  const [firstName, lastName, titleLabel, guestLimit, phone] = row;

  return [
    (firstName ?? '').trim(),
    (lastName ?? '').trim(),
    (titleLabel ?? '').trim(),
    (guestLimit ?? '').trim(),
    normalizePhone((phone ?? '').trim()),
  ];
}

export function normalizeHumanGuestSheet(rows: string[][]): NormalizeResult {
  if (rows.length === 0) {
    return { rows: [], errors: [{ row: 0, message: 'Sheet is empty' }] };
  }

  const [header, ...dataRows] = rows;
  const headerError = validateExactHeader(header, HUMAN_SHEET_HEADER);

  if (headerError !== null) {
    return { rows: [], errors: [{ row: 1, message: headerError }] };
  }

  return { rows: dataRows.map(normalizeRow), errors: [] };
}
