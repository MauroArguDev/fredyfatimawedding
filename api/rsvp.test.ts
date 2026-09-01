import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmGuest, findGuestByToken } from './_lib/guests';
import { isRsvpOpen } from './_lib/rsvpDeadline';
import { rsvpRateLimiter } from './_lib/rateLimit';
import { buildWhatsAppLink } from './_lib/whatsapp';
import handler from './rsvp';
import type { GuestRecord } from './_lib/guests';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('./_lib/guests', () => ({ confirmGuest: vi.fn(), findGuestByToken: vi.fn() }));
vi.mock('./_lib/rsvpDeadline', () => ({ isRsvpOpen: vi.fn() }));
vi.mock('./_lib/rateLimit', () => ({ rsvpRateLimiter: { shouldLimit: vi.fn() } }));
vi.mock('./_lib/whatsapp', () => ({ buildWhatsAppLink: vi.fn() }));

const TOKEN = 'V1StGXR8_Z5jdHi6B-myT';
const NOW = new Date('2026-09-10T12:00:00Z');
const OPENED_WELL_BEFORE_NOW = new Date(NOW.getTime() - 60_000);

function buildRequest(
  body: unknown,
  headers: Record<string, string | string[]> = {},
): VercelRequest {
  return {
    body,
    headers,
    socket: { remoteAddress: '203.0.113.9' },
  } as unknown as VercelRequest;
}

function buildResponse(): VercelResponse & { json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse & { json: ReturnType<typeof vi.fn> };
}

function buildGuestRecord(overrides: Partial<GuestRecord['data']> = {}): GuestRecord {
  return {
    ref: {} as unknown as GuestRecord['ref'],
    data: {
      firstName: 'Orlando',
      lastName: 'Martínez',
      titleLabel: 'Tío Orlando y Familia.',
      guestLimit: 3,
      phone: '+50370000000',
      notes: null,
      token: TOKEN,
      confirmed: false,
      confirmedCount: 0,
      confirmedAt: null,
      firstOpenedAt: OPENED_WELL_BEFORE_NOW,
      invitedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    },
  };
}

function mockConfirmableGuest(overrides: Partial<GuestRecord['data']> = {}): void {
  vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord(overrides));
  vi.mocked(confirmGuest).mockResolvedValue('confirmed');
}

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(rsvpRateLimiter.shouldLimit).mockReturnValue(false);
    vi.mocked(isRsvpOpen).mockReturnValue(true);
    vi.mocked(buildWhatsAppLink).mockReturnValue('https://wa.me/50376982534?text=hola');
  });

  it('respondsWithRateLimitedWhenTheIpLimiterTripsBeforeAnyOtherCheck', async () => {
    vi.mocked(rsvpRateLimiter.shouldLimit).mockReturnValue(true);
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 2 }), response);

    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.json).toHaveBeenCalledWith({ code: 'RATE_LIMITED' });
    expect(findGuestByToken).not.toHaveBeenCalled();
  });

  it('ratesLimitsByTheFirstAddressInAForwardedForChain', async () => {
    mockConfirmableGuest();
    const response = buildResponse();

    await handler(
      buildRequest({ token: TOKEN, count: 2 }, { 'x-forwarded-for': '198.51.100.4, 10.0.0.1' }),
      response,
    );

    expect(rsvpRateLimiter.shouldLimit).toHaveBeenCalledWith('198.51.100.4', NOW);
  });

  it('usesTheFirstEntryWhenXForwardedForArrivesAsAnArray', async () => {
    mockConfirmableGuest();
    const response = buildResponse();

    await handler(
      buildRequest({ token: TOKEN, count: 2 }, { 'x-forwarded-for': ['198.51.100.7', '10.0.0.1'] }),
      response,
    );

    expect(rsvpRateLimiter.shouldLimit).toHaveBeenCalledWith('198.51.100.7', NOW);
  });

  it('fallsBackToTheSocketAddressWhenThereIsNoForwardedForHeader', async () => {
    mockConfirmableGuest();
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 2 }), response);

    expect(rsvpRateLimiter.shouldLimit).toHaveBeenCalledWith('203.0.113.9', NOW);
  });

  it('fallsBackToUnknownWhenNeitherForwardedForNorTheSocketAddressAreAvailable', async () => {
    mockConfirmableGuest();
    const response = buildResponse();
    const request = {
      body: { token: TOKEN, count: 2 },
      headers: {},
      socket: {},
    } as unknown as VercelRequest;

    await handler(request, response);

    expect(rsvpRateLimiter.shouldLimit).toHaveBeenCalledWith('unknown', NOW);
  });

  it('rejectsAPayloadMissingRequiredFieldsWithInvalidPayload', async () => {
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ code: 'INVALID_PAYLOAD' });
    expect(findGuestByToken).not.toHaveBeenCalled();
  });

  it('rejectsACountOfZeroWithInvalidPayloadBecauseDecliningIsNotAnOption', async () => {
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 0 }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ code: 'INVALID_PAYLOAD' });
  });

  it('respondsWithTokenNotFoundForATokenNobodyHas', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(null);
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 1 }), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ code: 'TOKEN_NOT_FOUND' });
  });

  it('respondsWithRsvpClosedPastTheDeadlineWithoutWriting', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord());
    vi.mocked(isRsvpOpen).mockReturnValue(false);
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 1 }), response);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ code: 'RSVP_CLOSED' });
    expect(confirmGuest).not.toHaveBeenCalled();
  });

  it('rejectsASubmissionFromATokenThatWasNeverOpenedSoABarePostIsRejected', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord({ firstOpenedAt: null }));
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 1 }), response);

    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.json).toHaveBeenCalledWith({ code: 'RATE_LIMITED' });
    expect(confirmGuest).not.toHaveBeenCalled();
  });

  it('rejectsASubmissionThatArrivesLessThanTheMinimumFillTimeAfterOpening', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(
      buildGuestRecord({ firstOpenedAt: new Date(NOW.getTime() - 500) }),
    );
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 1 }), response);

    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.json).toHaveBeenCalledWith({ code: 'RATE_LIMITED' });
    expect(confirmGuest).not.toHaveBeenCalled();
  });

  it('rejectsACountAboveTheGuestLimitWithCountOutOfRange', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord({ guestLimit: 2 }));
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 3 }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ code: 'COUNT_OUT_OF_RANGE' });
    expect(confirmGuest).not.toHaveBeenCalled();
  });

  it('respondsWithAlreadyConfirmedWhenTheTransactionFindsAnExistingConfirmation', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord());
    vi.mocked(confirmGuest).mockResolvedValue('already-confirmed');
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 2 }), response);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ code: 'ALREADY_CONFIRMED' });
  });

  it('respondsWithOkAndAWaLinkOnASuccessfulConfirmation', async () => {
    mockConfirmableGuest();
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 2 }), response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      ok: true,
      waLink: 'https://wa.me/50376982534?text=hola',
    });
  });

  it('buildsTheWhatsappMessageFromTheGuestsNameAndTheConfirmedCount', async () => {
    mockConfirmableGuest({ firstName: 'Fátima', lastName: null, guestLimit: 5 });
    const response = buildResponse();

    await handler(buildRequest({ token: TOKEN, count: 4 }), response);

    expect(buildWhatsAppLink).toHaveBeenCalledWith(
      'Hola, soy Fátima. Confirmo mi asistencia a la boda con 4 personas.',
    );
  });
});
