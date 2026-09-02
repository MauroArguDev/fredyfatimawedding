import { readFileSync } from 'node:fs';
import { importGuests } from '../api/_lib/guests';
import { requireArg, reportRowErrorsAndExit } from './lib/cli';
import { parseCsv } from './lib/csv';
import { mapCsvToGuestInputs } from './lib/guestImport';

async function main(): Promise<void> {
  const path = requireArg(2, 'Usage: npm run import:guests -- <path-to-csv>');
  const content = readFileSync(path, 'utf8');
  const { guests, errors } = mapCsvToGuestInputs(parseCsv(content));

  if (errors.length > 0) {
    reportRowErrorsAndExit('Import aborted, nothing was written. Errors:', errors);
  }

  const { imported, skipped } = await importGuests(guests);

  console.warn(
    `Imported ${String(imported)} guest(s), skipped ${String(skipped)} already present by phone.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
