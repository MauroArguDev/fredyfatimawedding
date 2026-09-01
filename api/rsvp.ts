import { fitsWithinGuestLimit, rsvpRequestSchema } from '../src/schemas/guest.js';
import { buildRsvpConfirmationMessage } from '../src/content/whatsapp.js';
import { confirmGuest, findGuestByToken } from './_lib/guests.js';
import { isRsvpOpen } from './_lib/rsvpDeadline.js';
import { rsvpRateLimiter } from './_lib/rateLimit.js';
import { buildWhatsAppLink } from './_lib/whatsapp.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_TOO_MANY_REQUESTS = 429;

const MINIMUM_FILL_TIME_MS = 3000;

function extractClientIp(request: VercelRequest): string {
  const forwardedFor = request.headers['x-forwarded-for'];
  const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;

  if (typeof value === 'string' && value.length > 0) {
    return value.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.socket.remoteAddress ?? 'unknown';
}

function submittedTooFastOrNeverOpened(firstOpenedAt: Date | null, now: Date): boolean {
  return firstOpenedAt === null || now.getTime() - firstOpenedAt.getTime() < MINIMUM_FILL_TIME_MS;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (rsvpRateLimiter.shouldLimit(extractClientIp(request), new Date())) {
    response.status(HTTP_TOO_MANY_REQUESTS).json({ code: 'RATE_LIMITED' });
    return;
  }

  const parsed = rsvpRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(HTTP_BAD_REQUEST).json({ code: 'INVALID_PAYLOAD' });
    return;
  }

  const { token, count } = parsed.data;
  const guest = await findGuestByToken(token);

  if (guest === null) {
    response.status(HTTP_NOT_FOUND).json({ code: 'TOKEN_NOT_FOUND' });
    return;
  }

  const now = new Date();

  if (!isRsvpOpen(now)) {
    response.status(HTTP_CONFLICT).json({ code: 'RSVP_CLOSED' });
    return;
  }

  if (submittedTooFastOrNeverOpened(guest.data.firstOpenedAt, now)) {
    response.status(HTTP_TOO_MANY_REQUESTS).json({ code: 'RATE_LIMITED' });
    return;
  }

  if (!fitsWithinGuestLimit(count, guest.data.guestLimit)) {
    response.status(HTTP_BAD_REQUEST).json({ code: 'COUNT_OUT_OF_RANGE' });
    return;
  }

  const outcome = await confirmGuest(guest.ref, count, now);

  if (outcome === 'already-confirmed') {
    response.status(HTTP_CONFLICT).json({ code: 'ALREADY_CONFIRMED' });
    return;
  }

  const message = buildRsvpConfirmationMessage({
    firstName: guest.data.firstName,
    lastName: guest.data.lastName,
    count,
  });

  response.status(HTTP_OK).json({ ok: true, waLink: buildWhatsAppLink(message) });
}
