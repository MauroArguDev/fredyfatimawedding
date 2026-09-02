import { createGuestSchema } from '../../src/schemas/guest.js';
import type { CreateGuestInput } from '../../src/schemas/guest.js';
import { validateExactHeader } from './rowValidation.js';
import type { RowError } from './rowValidation.js';

export const REQUIRED_CSV_HEADER = [
  'firstName',
  'lastName',
  'titleLabel',
  'guestLimit',
  'phone',
] as const;

export interface GuestImportResult {
  guests: CreateGuestInput[];
  errors: RowError[];
}

function buildRawGuest(header: string[], row: string[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  header.forEach((key, index) => {
    const value = (row[index] ?? '').trim();

    if (key === 'guestLimit') {
      record[key] = value.length > 0 ? Number(value) : Number.NaN;
    } else if (key === 'lastName' || key === 'titleLabel') {
      record[key] = value.length > 0 ? value : null;
    } else {
      record[key] = value;
    }
  });

  return record;
}

export function mapCsvToGuestInputs(rows: string[][]): GuestImportResult {
  if (rows.length === 0) {
    return { guests: [], errors: [{ row: 0, message: 'CSV file is empty' }] };
  }

  const [header, ...dataRows] = rows;
  const headerError = validateExactHeader(header, REQUIRED_CSV_HEADER);

  if (headerError !== null || header === undefined) {
    return { guests: [], errors: [{ row: 1, message: headerError ?? 'Missing header row' }] };
  }

  const guests: CreateGuestInput[] = [];
  const errors: RowError[] = [];

  dataRows.forEach((row, index) => {
    const result = createGuestSchema.safeParse(buildRawGuest(header, row));

    if (result.success) {
      guests.push(result.data);
    } else {
      const rowNumber = index + 2;
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      errors.push({ row: rowNumber, message });
    }
  });

  return errors.length > 0 ? { guests: [], errors } : { guests, errors: [] };
}

export function partitionNewGuests(
  guests: CreateGuestInput[],
  existingPhones: ReadonlySet<string>,
): { toCreate: CreateGuestInput[]; alreadyPresent: CreateGuestInput[] } {
  const toCreate: CreateGuestInput[] = [];
  const alreadyPresent: CreateGuestInput[] = [];

  for (const guest of guests) {
    if (existingPhones.has(guest.phone)) {
      alreadyPresent.push(guest);
    } else {
      toCreate.push(guest);
    }
  }

  return { toCreate, alreadyPresent };
}
