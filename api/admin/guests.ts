import { computeGuestStats, createGuestSchema } from '../../src/schemas/guest.js';
import { withAdminAuth } from '../_lib/adminAuth.js';
import { createGuest, listGuests } from '../_lib/guests.js';
import type { GuestListItem } from '../_lib/guests.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;

function toApiGuest(item: GuestListItem): Record<string, unknown> {
  return { id: item.id, ...item.data };
}

async function handleList(response: VercelResponse): Promise<void> {
  const guests = await listGuests();

  response.status(HTTP_OK).json({
    guests: guests.map(toApiGuest),
    stats: computeGuestStats(guests.map((guest) => guest.data)),
  });
}

async function handleCreate(request: VercelRequest, response: VercelResponse): Promise<void> {
  const parsed = createGuestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(HTTP_BAD_REQUEST).json({ code: 'INVALID_PAYLOAD' });
    return;
  }

  const created = await createGuest(parsed.data);

  response.status(HTTP_CREATED).json(toApiGuest(created));
}

export default withAdminAuth(async (request, response) => {
  if (request.method === 'GET') {
    await handleList(response);
    return;
  }

  if (request.method === 'POST') {
    await handleCreate(request, response);
    return;
  }

  response.status(HTTP_METHOD_NOT_ALLOWED).json({ code: 'METHOD_NOT_ALLOWED' });
});
