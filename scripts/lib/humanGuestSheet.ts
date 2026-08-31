export const HUMAN_SHEET_HEADER = [
  'Nombre',
  'Apellido',
  'Trato para el sobre',
  'Cupo de invitados',
  'Teléfono',
] as const;

const EL_SALVADOR_COUNTRY_CODE = '+503';
const LOCAL_PHONE_DIGIT_COUNT = 8;
const INTERNATIONAL_TRUNK_PREFIX = '00';

export interface NormalizeRowError {
  row: number;
  message: string;
}

export interface NormalizeResult {
  rows: string[][];
  errors: NormalizeRowError[];
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

function validateHeader(header: string[] | undefined): string | null {
  const expected = HUMAN_SHEET_HEADER.join(',');
  const actual = (header ?? []).join(',');

  return actual === expected ? null : `Expected header "${expected}", got "${actual}"`;
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
  const headerError = validateHeader(header);

  if (headerError !== null) {
    return { rows: [], errors: [{ row: 1, message: headerError }] };
  }

  return { rows: dataRows.map(normalizeRow), errors: [] };
}
