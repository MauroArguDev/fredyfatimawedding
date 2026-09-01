import { publicInvitationSchema } from '../../src/schemas/guest';
import { findGuestByToken } from '../_lib/guests';
import { extractRouteParam } from '../_lib/httpParams';
import { isRsvpOpen } from '../_lib/rsvpDeadline';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  const token = extractRouteParam(request.query, 'token');
  const guest = token === null ? null : await findGuestByToken(token);

  if (guest === null) {
    response.status(HTTP_NOT_FOUND).json({ code: 'TOKEN_NOT_FOUND' });
    return;
  }

  if (guest.data.firstOpenedAt === null) {
    await guest.ref.update({ firstOpenedAt: new Date() });
  }

  response.status(HTTP_OK).json(
    publicInvitationSchema.parse({
      titleLabel: guest.data.titleLabel,
      firstName: guest.data.firstName,
      guestLimit: guest.data.guestLimit,
      confirmed: guest.data.confirmed,
      confirmedCount: guest.data.confirmedCount,
      rsvpOpen: isRsvpOpen(new Date()),
    }),
  );
}
