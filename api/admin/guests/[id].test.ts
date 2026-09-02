import { describe, expect, it, vi } from 'vitest';
import { deleteGuestById, updateGuest } from '../../_lib/guests';
import handler from './[id]';
import type { GuestRecord } from '../../_lib/guests';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../../_lib/adminAuth', () => ({ withAdminAuth: (fn: unknown) => fn }));
vi.mock('../../_lib/guests', () => ({ updateGuest: vi.fn(), deleteGuestById: vi.fn() }));

function buildRequest(method: string, id: unknown, body?: unknown): VercelRequest {
  return { method, query: { id }, body } as unknown as VercelRequest;
}

interface MockResponse {
  response: VercelResponse;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
}

function buildResponse(): MockResponse {
  const json = vi.fn();
  const end = vi.fn();
  const status = vi.fn(() => ({ json, end }));

  return { response: { status } as unknown as VercelResponse, status, json, end };
}

const guestRecord: GuestRecord = {
  ref: {} as unknown as GuestRecord['ref'],
  data: {
    firstName: 'Orlando',
    lastName: null,
    titleLabel: null,
    guestLimit: 4,
    phone: '+50370000000',
    token: 'V1StGXR8_Z5jdHi6B-myT',
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    invitedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
};

describe('PATCH /api/admin/guests/[id]', () => {
  it('respondsWithNotFoundWhenTheIdParamIsMissing', async () => {
    const { response, status } = buildResponse();

    await handler(buildRequest('PATCH', undefined, { guestLimit: 2 }), response);

    expect(status).toHaveBeenCalledWith(404);
    expect(updateGuest).not.toHaveBeenCalled();
  });

  it('rejectsAnInvalidPayloadWithoutCallingUpdateGuest', async () => {
    const { response, status, json } = buildResponse();

    await handler(buildRequest('PATCH', 'abc', { guestLimit: 'not-a-number' }), response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ code: 'INVALID_PAYLOAD' });
    expect(updateGuest).not.toHaveBeenCalled();
  });

  it('respondsWithNotFoundWhenTheGuestDoesNotExist', async () => {
    vi.mocked(updateGuest).mockResolvedValue({ ok: false, code: 'NOT_FOUND' });
    const { response, status, json } = buildResponse();

    await handler(buildRequest('PATCH', 'missing', { guestLimit: 2 }), response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ code: 'NOT_FOUND' });
  });

  it('respondsWithFourHundredWhenGuestLimitWouldDropBelowConfirmedCount', async () => {
    vi.mocked(updateGuest).mockResolvedValue({
      ok: false,
      code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT',
    });
    const { response, status, json } = buildResponse();

    await handler(buildRequest('PATCH', 'abc', { guestLimit: 1 }), response);

    expect(status).toHaveBeenCalledWith(400);
    const [body] = json.mock.calls[0] as [{ code: string; message: string }];
    expect(body.code).toBe('GUEST_LIMIT_BELOW_CONFIRMED_COUNT');
    expect(body.message.length).toBeGreaterThan(0);
  });

  it('respondsWithTheUpdatedGuestOnSuccess', async () => {
    vi.mocked(updateGuest).mockResolvedValue({ ok: true, record: guestRecord });
    const { response, status, json } = buildResponse();

    await handler(buildRequest('PATCH', 'abc', { guestLimit: 2 }), response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: 'abc', ...guestRecord.data });
  });
});

describe('DELETE /api/admin/guests/[id]', () => {
  it('respondsWithNoContentWhenDeleted', async () => {
    vi.mocked(deleteGuestById).mockResolvedValue(true);
    const { response, status, end } = buildResponse();

    await handler(buildRequest('DELETE', 'abc'), response);

    expect(status).toHaveBeenCalledWith(204);
    expect(end).toHaveBeenCalled();
  });

  it('respondsWithNotFoundWhenTheGuestDoesNotExist', async () => {
    vi.mocked(deleteGuestById).mockResolvedValue(false);
    const { response, status, json } = buildResponse();

    await handler(buildRequest('DELETE', 'missing'), response);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ code: 'NOT_FOUND' });
  });
});

describe('unsupported methods on /api/admin/guests/[id]', () => {
  it('respondsWithMethodNotAllowed', async () => {
    const { response, status } = buildResponse();

    await handler(buildRequest('GET', 'abc'), response);

    expect(status).toHaveBeenCalledWith(405);
  });
});
