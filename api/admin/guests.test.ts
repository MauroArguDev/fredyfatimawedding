import { describe, expect, it, vi } from 'vitest';
import { createGuest, listGuests } from '../_lib/guests';
import handler from './guests';
import type { GuestListItem } from '../_lib/guests';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../_lib/adminAuth', () => ({ withAdminAuth: (fn: unknown) => fn }));
vi.mock('../_lib/guests', () => ({ listGuests: vi.fn(), createGuest: vi.fn() }));

function buildRequest(method: string, body?: unknown): VercelRequest {
  return { method, body } as unknown as VercelRequest;
}

function buildResponse(): VercelResponse & { json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse & { json: ReturnType<typeof vi.fn> };
}

function buildGuestListItem(overrides: Partial<GuestListItem['data']> = {}): GuestListItem {
  return {
    id: 'abc',
    data: {
      firstName: 'Orlando',
      lastName: null,
      titleLabel: 'Tío Orlando y Familia.',
      guestLimit: 3,
      phone: '+50370000000',
      token: 'V1StGXR8_Z5jdHi6B-myT',
      confirmed: false,
      confirmedCount: 0,
      confirmedAt: null,
      firstOpenedAt: null,
      invitedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    },
  };
}

describe('GET /api/admin/guests', () => {
  it('respondsWithTheGuestListAndComputedStats', async () => {
    vi.mocked(listGuests).mockResolvedValue([
      buildGuestListItem(),
      buildGuestListItem({ confirmed: true, confirmedCount: 2 }),
    ]);
    const response = buildResponse();

    await handler(buildRequest('GET'), response);

    expect(response.status).toHaveBeenCalledWith(200);
    const [body] = response.json.mock.calls[0] as [
      { guests: unknown[]; stats: Record<string, number> },
    ];
    expect(body.guests).toHaveLength(2);
    expect(body.stats).toEqual({
      total: 2,
      confirmed: 1,
      pending: 1,
      openedNotConfirmed: 0,
      totalConfirmedPeople: 2,
    });
  });

  it('flattensEachGuestWithItsDocumentId', async () => {
    vi.mocked(listGuests).mockResolvedValue([buildGuestListItem()]);
    const response = buildResponse();

    await handler(buildRequest('GET'), response);

    const [body] = response.json.mock.calls[0] as [{ guests: Record<string, unknown>[] }];
    expect(body.guests[0]).toMatchObject({ id: 'abc', firstName: 'Orlando' });
  });
});

describe('POST /api/admin/guests', () => {
  const validPayload = {
    firstName: 'Orlando',
    guestLimit: 3,
    phone: '+50370000000',
  };

  it('rejectsAnInvalidPayloadWithoutCallingCreateGuest', async () => {
    const response = buildResponse();

    await handler(buildRequest('POST', { firstName: 'Orlando' }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ code: 'INVALID_PAYLOAD' });
    expect(createGuest).not.toHaveBeenCalled();
  });

  it('createsTheGuestAndRespondsWithTwoOhOne', async () => {
    vi.mocked(createGuest).mockResolvedValue(buildGuestListItem());
    const response = buildResponse();

    await handler(buildRequest('POST', validPayload), response);

    expect(response.status).toHaveBeenCalledWith(201);
    const [body] = response.json.mock.calls[0] as [Record<string, unknown>];
    expect(body).toMatchObject({ id: 'abc', firstName: 'Orlando' });
  });
});

describe('unsupported methods on /api/admin/guests', () => {
  it('respondsWithMethodNotAllowedForAnythingElse', async () => {
    const response = buildResponse();

    await handler(buildRequest('DELETE'), response);

    expect(response.status).toHaveBeenCalledWith(405);
    expect(response.json).toHaveBeenCalledWith({ code: 'METHOD_NOT_ALLOWED' });
  });
});
