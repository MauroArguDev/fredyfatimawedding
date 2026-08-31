import { readFileSync } from 'node:fs';
import { nanoid } from 'nanoid';
import { firestore, GUESTS_COLLECTION } from '../api/_lib/firestore';
import { TOKEN_LENGTH } from '../src/schemas/guest';
import type { CreateGuestInput } from '../src/schemas/guest';
import { requireArg, reportRowErrorsAndExit } from './lib/cli';
import { parseCsv } from './lib/csv';
import { mapCsvToGuestInputs, partitionNewGuests } from './lib/guestImport';

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
  const path = requireArg(2, 'Usage: npm run import:guests -- <path-to-csv>');
  const content = readFileSync(path, 'utf8');
  const { guests, errors } = mapCsvToGuestInputs(parseCsv(content));

  if (errors.length > 0) {
    reportRowErrorsAndExit('Import aborted, nothing was written. Errors:', errors);
  }

  const existingPhones = await fetchExistingPhones();
  await writeGuests(guests, existingPhones);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
