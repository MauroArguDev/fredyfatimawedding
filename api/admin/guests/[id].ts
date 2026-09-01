import { updateGuestSchema } from '../../../src/schemas/guest.js';
import { withAdminAuth } from '../../_lib/adminAuth.js';
import { deleteGuestById, updateGuest } from '../../_lib/guests.js';
import { extractRouteParam } from '../../_lib/httpParams.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;

async function handlePatch(
  id: string,
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  const parsed = updateGuestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(HTTP_BAD_REQUEST).json({ code: 'INVALID_PAYLOAD' });
    return;
  }

  const outcome = await updateGuest(id, parsed.data);

  if (!outcome.ok) {
    if (outcome.code === 'NOT_FOUND') {
      response.status(HTTP_NOT_FOUND).json({ code: 'NOT_FOUND' });
      return;
    }

    response.status(HTTP_BAD_REQUEST).json({
      code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT',
      message: 'guestLimit cannot be lower than the guest’s confirmedCount.',
    });
    return;
  }

  response.status(HTTP_OK).json({ id, ...outcome.record.data });
}

async function handleDelete(id: string, response: VercelResponse): Promise<void> {
  const deleted = await deleteGuestById(id);

  if (!deleted) {
    response.status(HTTP_NOT_FOUND).json({ code: 'NOT_FOUND' });
    return;
  }

  response.status(HTTP_NO_CONTENT).end();
}

export default withAdminAuth(async (request, response) => {
  const id = extractRouteParam(request.query, 'id');

  if (id === null) {
    response.status(HTTP_NOT_FOUND).json({ code: 'NOT_FOUND' });
    return;
  }

  if (request.method === 'PATCH') {
    await handlePatch(id, request, response);
    return;
  }

  if (request.method === 'DELETE') {
    await handleDelete(id, response);
    return;
  }

  response.status(HTTP_METHOD_NOT_ALLOWED).json({ code: 'METHOD_NOT_ALLOWED' });
});
