import { describe, expect, it, vi } from 'vitest';
import { rotateGuestToken } from '../../../_lib/guests';
import handler from './rotate-token';
import type { GuestRecord } from '../../../_lib/guests';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../../../_lib/adminAuth', () => ({ withAdminAuth: (fn: unknown) => fn }));
vi.mock('../../../_lib/guests', () => ({ rotateGuestToken: vi.fn() }));

function buildRequest(method: string, id: unknown): VercelRequest {
  return { method, query: { id } } as unknown as VercelRequest;
}

function buildResponse(): VercelResponse & { json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse & { json: ReturnType<typeof vi.fn> };
}

const guestRecord: GuestRecord = {
  ref: {} as unknown as GuestRecord['ref'],
  data: {
    firstName: 'Orlando',
    lastName: null,
    titleLabel: null,
    guestLimit: 4,
    phone: '+50370000000',
    notes: null,
    token: 'new-token-abc',
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
};

describe('POST /api/admin/guests/[id]/rotate-token', () => {
  it('respondsWithMethodNotAllowedForNonPost', async () => {
    const response = buildResponse();

    await handler(buildRequest('GET', 'abc'), response);

    expect(response.status).toHaveBeenCalledWith(405);
    expect(rotateGuestToken).not.toHaveBeenCalled();
  });

  it('respondsWithNotFoundWhenTheIdParamIsMissing', async () => {
    const response = buildResponse();

    await handler(buildRequest('POST', undefined), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(rotateGuestToken).not.toHaveBeenCalled();
  });

  it('respondsWithNotFoundWhenTheGuestDoesNotExist', async () => {
    vi.mocked(rotateGuestToken).mockResolvedValue(null);
    const response = buildResponse();

    await handler(buildRequest('POST', 'missing'), response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ code: 'NOT_FOUND' });
  });

  it('respondsWithTheRotatedGuestOnSuccess', async () => {
    vi.mocked(rotateGuestToken).mockResolvedValue(guestRecord);
    const response = buildResponse();

    await handler(buildRequest('POST', 'abc'), response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ id: 'abc', ...guestRecord.data });
  });
});
