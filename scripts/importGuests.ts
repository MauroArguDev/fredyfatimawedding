import { readFileSync } from 'node:fs';
import { nanoid } from 'nanoid';
import { firestore, GUESTS_COLLECTION } from '../api/_lib/firestore';
import { TOKEN_LENGTH } from '../src/schemas/guest';
import type { CreateGuestInput } from '../src/schemas/guest';
import { parseCsv } from './lib/csv';
import { mapCsvToGuestInputs, partitionNewGuests } from './lib/guestImport';

function readCsvPath(): string {
  const path = process.argv[2];

  if (path === undefined) {
    console.error('Usage: npm run import:guests -- <path-to-csv>');
    process.exit(1);
  }

  return path;
}

async function fetchExistingPhones(): Promise<Set<string>> {
  const snapshot = await firestore().collection(GUESTS_COLLECTION).select('phone').get();

  return new Set(snapshot.docs.map((doc) => String(doc.get('phone'))));
}

function buildGuestDocument(input: CreateGuestInput): Record<string, unknown> {
  const now = new Date();

  return {
    ...input,
    token: nanoid(TOKEN_LENGTH),
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

async function writeGuests(guests: CreateGuestInput[], existingPhones: Set<string>): Promise<void> {
  const { toCreate, alreadyPresent } = partitionNewGuests(guests, existingPhones);
  const collection = firestore().collection(GUESTS_COLLECTION);
  const batch = firestore().batch();

  for (const guest of toCreate) {
    batch.set(collection.doc(), buildGuestDocument(guest));
  }

  if (toCreate.length > 0) {
    await batch.commit();
  }

  console.warn(
    `Imported ${String(toCreate.length)} guest(s), skipped ${String(alreadyPresent.length)} already present by phone.`,
  );
}

async function main(): Promise<void> {
  const path = readCsvPath();
  const content = readFileSync(path, 'utf8');
  const { guests, errors } = mapCsvToGuestInputs(parseCsv(content));

  if (errors.length > 0) {
    console.error('Import aborted, nothing was written. Errors:');
    for (const error of errors) {
      console.error(`  Row ${String(error.row)}: ${error.message}`);
    }
    process.exit(1);
  }

  const existingPhones = await fetchExistingPhones();
  await writeGuests(guests, existingPhones);
}

await main();
