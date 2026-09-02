import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findGuestByToken } from '../_lib/guests';
import { isRsvpOpen } from '../_lib/rsvpDeadline';
import handler from './[token]';
import type { GuestRecord } from '../_lib/guests';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../_lib/guests', () => ({ findGuestByToken: vi.fn() }));
vi.mock('../_lib/rsvpDeadline', () => ({ isRsvpOpen: vi.fn() }));

const TOKEN = 'V1StGXR8_Z5jdHi6B-myT';

function buildRequest(token: unknown): VercelRequest {
  return { query: { token } } as unknown as VercelRequest;
}

function buildResponse(): VercelResponse & { json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse & { json: ReturnType<typeof vi.fn> };
}

function buildGuestRecord(overrides: Partial<GuestRecord['data']> = {}): {
  record: GuestRecord;
  update: ReturnType<typeof vi.fn>;
} {
  const update = vi.fn().mockResolvedValue(undefined);

  return {
    record: {
      ref: { update } as unknown as GuestRecord['ref'],
      data: {
        firstName: 'Orlando',
        lastName: null,
        titleLabel: 'Tío Orlando y Familia.',
        guestLimit: 3,
        phone: '+50370000000',
        token: TOKEN,
        confirmed: false,
        confirmedCount: 0,
        confirmedAt: null,
        firstOpenedAt: null,
        invitedAt: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
      },
    },
    update,
  };
}

describe('GET /api/invitation/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isRsvpOpen).mockReturnValue(true);
  });

  it('respondsWithThePublicInvitationShapeForAValidToken', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord().record);
    const response = buildResponse();

    await handler(buildRequest(TOKEN), response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      titleLabel: 'Tío Orlando y Familia.',
      firstName: 'Orlando',
      guestLimit: 3,
      confirmed: false,
      confirmedCount: 0,
      rsvpOpen: true,
    });
  });

  it('neverReturnsPhoneOrTokenBecauseTheyAreNotForTheGuestsEyes', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord().record);
    const response = buildResponse();

    await handler(buildRequest(TOKEN), response);

    const [body] = response.json.mock.calls[0] as [Record<string, unknown>];

    expect(body).not.toHaveProperty('phone');
    expect(body).not.toHaveProperty('token');
  });

  it('respondsWithFourOhFourForATokenThatDoesNotExist', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(null);
    const response = buildResponse();

    await handler(buildRequest('a-token-nobody-has'), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ code: 'TOKEN_NOT_FOUND' });
  });

  it('respondsWithFourOhFourForAMalformedTokenWithoutQueryingFirestore', async () => {
    const response = buildResponse();

    await handler(buildRequest(['duplicate', 'query', 'param']), response);

    expect(findGuestByToken).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ code: 'TOKEN_NOT_FOUND' });
  });

  it('writesFirstOpenedAtOnlyWhenItWasNull', async () => {
    const { record, update } = buildGuestRecord({ firstOpenedAt: null });
    vi.mocked(findGuestByToken).mockResolvedValue(record);
    const response = buildResponse();

    await handler(buildRequest(TOKEN), response);

    expect(update).toHaveBeenCalledTimes(1);
    const call = update.mock.calls[0] as [{ firstOpenedAt: Date }] | undefined;
    expect(call?.[0].firstOpenedAt).toBeInstanceOf(Date);
  });

  it('doesNotOverwriteFirstOpenedAtOnASecondVisit', async () => {
    const { record, update } = buildGuestRecord({
      firstOpenedAt: new Date('2026-09-01T00:00:00Z'),
    });
    vi.mocked(findGuestByToken).mockResolvedValue(record);
    const response = buildResponse();

    await handler(buildRequest(TOKEN), response);

    expect(update).not.toHaveBeenCalled();
  });

  it('reflectsAnAlreadyConfirmedGuestInTheResponse', async () => {
    const { record } = buildGuestRecord({
      confirmed: true,
      confirmedCount: 2,
      firstOpenedAt: new Date('2026-09-01T00:00:00Z'),
    });
    vi.mocked(findGuestByToken).mockResolvedValue(record);
    const response = buildResponse();

    await handler(buildRequest(TOKEN), response);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ confirmed: true, confirmedCount: 2 }),
    );
  });

  it('reflectsThatRsvpIsClosedPastTheDeadline', async () => {
    vi.mocked(findGuestByToken).mockResolvedValue(buildGuestRecord().record);
    vi.mocked(isRsvpOpen).mockReturnValue(false);
    const response = buildResponse();

    await handler(buildRequest(TOKEN), response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ rsvpOpen: false }));
  });
});
