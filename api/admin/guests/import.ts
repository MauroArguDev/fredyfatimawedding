import { parseCsv } from '../../../scripts/lib/csv.js';
import { mapCsvToGuestInputs } from '../../../scripts/lib/guestImport.js';
import { withAdminAuth } from '../../_lib/adminAuth.js';
import { importGuests } from '../../_lib/guests.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;

function isImportRequestBody(body: unknown): body is { csv: string } {
  return typeof body === 'object' && body !== null && 'csv' in body && typeof body.csv === 'string';
}

async function handleImport(request: VercelRequest, response: VercelResponse): Promise<void> {
  if (!isImportRequestBody(request.body)) {
    response.status(HTTP_BAD_REQUEST).json({ code: 'INVALID_PAYLOAD' });
    return;
  }

  const { guests, errors } = mapCsvToGuestInputs(parseCsv(request.body.csv));

  if (errors.length > 0) {
    response.status(HTTP_BAD_REQUEST).json({ code: 'INVALID_CSV', errors });
    return;
  }

  const result = await importGuests(guests);

  response.status(HTTP_OK).json(result);
}

export default withAdminAuth(async (request, response) => {
  if (request.method !== 'POST') {
    response.status(HTTP_METHOD_NOT_ALLOWED).json({ code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  await handleImport(request, response);
});
