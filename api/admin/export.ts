import { stringifyCsv } from '../../scripts/lib/csv.js';
import {
  CONFIRMED_LABEL,
  GUEST_EXPORT_FILENAME,
  GUEST_EXPORT_HEADER,
  NOT_CONFIRMED_LABEL,
} from '../../src/content/guestExport.js';
import { withAdminAuth } from '../_lib/adminAuth.js';
import { listGuests } from '../_lib/guests.js';
import type { Guest } from '../../src/schemas/guest.js';

const HTTP_OK = 200;
const HTTP_METHOD_NOT_ALLOWED = 405;
const UTF8_BOM_CODE_POINT = 0xfeff;

function formatDate(value: Date | null): string {
  return value === null ? '' : value.toISOString();
}

function toRow(guest: Guest): string[] {
  return [
    guest.firstName,
    guest.lastName ?? '',
    guest.titleLabel ?? '',
    String(guest.guestLimit),
    guest.phone,
    guest.confirmed ? CONFIRMED_LABEL : NOT_CONFIRMED_LABEL,
    String(guest.confirmedCount),
    formatDate(guest.confirmedAt),
    formatDate(guest.firstOpenedAt),
  ];
}

export default withAdminAuth(async (request, response) => {
  if (request.method !== 'GET') {
    response.status(HTTP_METHOD_NOT_ALLOWED).json({ code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const guests = await listGuests();
  const rows = [[...GUEST_EXPORT_HEADER], ...guests.map((guest) => toRow(guest.data))];
  const csv = String.fromCharCode(UTF8_BOM_CODE_POINT) + stringifyCsv(rows);

  response.setHeader('Content-Type', 'text/csv; charset=utf-8');
  response.setHeader('Content-Disposition', `attachment; filename="${GUEST_EXPORT_FILENAME}"`);
  response.status(HTTP_OK).send(csv);
});
