import { describe, expect, it, vi } from 'vitest';
import { listGuests } from '../_lib/guests';
import handler from './export';
import type { GuestListItem } from '../_lib/guests';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../_lib/adminAuth', () => ({ withAdminAuth: (fn: unknown) => fn }));
vi.mock('../_lib/guests', () => ({ listGuests: vi.fn() }));

function buildRequest(method: string): VercelRequest {
  return { method } as unknown as VercelRequest;
}

interface MockResponse {
  response: VercelResponse;
  status: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function buildResponse(): MockResponse {
  const send = vi.fn();
  const json = vi.fn();
  const setHeader = vi.fn();
  const status = vi.fn(() => ({ send, json }));

  return {
    response: { status, setHeader } as unknown as VercelResponse,
    status,
    setHeader,
    send,
    json,
  };
}

function buildGuestListItem(overrides: Partial<GuestListItem['data']> = {}): GuestListItem {
  return {
    id: 'abc',
    data: {
      firstName: 'Orlando',
      lastName: 'Martínez',
      titleLabel: 'Tío Orlando y Familia.',
      guestLimit: 3,
      phone: '+50370000000',
      token: 'V1StGXR8_Z5jdHi6B-myT',
      confirmed: true,
      confirmedCount: 2,
      confirmedAt: new Date('2026-09-01T00:00:00Z'),
      firstOpenedAt: new Date('2026-08-30T00:00:00Z'),
      invitedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    },
  };
}

describe('GET /api/admin/export', () => {
  it('respondsWithMethodNotAllowedForNonGet', async () => {
    const { response, status } = buildResponse();

    await handler(buildRequest('POST'), response);

    expect(status).toHaveBeenCalledWith(405);
    expect(listGuests).not.toHaveBeenCalled();
  });

  it('setsCsvContentTypeAndAnAttachmentFilename', async () => {
    vi.mocked(listGuests).mockResolvedValue([]);
    const { response, setHeader } = buildResponse();

    await handler(buildRequest('GET'), response);

    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="invitados.csv"',
    );
  });

  it('startsTheBodyWithAUtf8BomSoExcelReadsAccentsCorrectly', async () => {
    vi.mocked(listGuests).mockResolvedValue([]);
    const { response, send } = buildResponse();

    await handler(buildRequest('GET'), response);

    const [body] = send.mock.calls[0] as [string];
    expect(body.charCodeAt(0)).toBe(0xfeff);
  });

  it('includesTheSpanishHeaderRow', async () => {
    vi.mocked(listGuests).mockResolvedValue([]);
    const { response, send } = buildResponse();

    await handler(buildRequest('GET'), response);

    const [body] = send.mock.calls[0] as [string];
    expect(body).toContain('Nombre,Apellido,Texto en sobre');
  });

  it('rendersAConfirmedGuestRowWithSiAndTheirCounts', async () => {
    vi.mocked(listGuests).mockResolvedValue([buildGuestListItem()]);
    const { response, send } = buildResponse();

    await handler(buildRequest('GET'), response);

    const [body] = send.mock.calls[0] as [string];
    expect(body).toContain('Orlando,Martínez,Tío Orlando y Familia.,3,+50370000000,Sí,2');
  });

  it('rendersAPendingGuestRowWithNoAndEmptyDates', async () => {
    vi.mocked(listGuests).mockResolvedValue([
      buildGuestListItem({
        confirmed: false,
        confirmedCount: 0,
        confirmedAt: null,
        firstOpenedAt: null,
        lastName: null,
        titleLabel: null,
      }),
    ]);
    const { response, send } = buildResponse();

    await handler(buildRequest('GET'), response);

    const [body] = send.mock.calls[0] as [string];
    expect(body).toContain('Orlando,,,3,+50370000000,No,0');
  });
});
