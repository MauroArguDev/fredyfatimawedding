import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importGuests } from '../../_lib/guests';
import handler from './import';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('../../_lib/adminAuth', () => ({ withAdminAuth: (fn: unknown) => fn }));
vi.mock('../../_lib/guests', () => ({ importGuests: vi.fn() }));

beforeEach(() => {
  vi.mocked(importGuests).mockReset();
});

function buildRequest(method: string, body?: unknown): VercelRequest {
  return { method, body } as unknown as VercelRequest;
}

function buildResponse(): VercelResponse & { json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse & { json: ReturnType<typeof vi.fn> };
}

const HUMAN_HEADER = 'Nombre,Apellido,Texto en sobre,Cupo de invitados,Teléfono';
const VALID_CSV = `${HUMAN_HEADER}\nOrlando,,,3,7000-0000\n`;
const VALID_SEMICOLON_CSV =
  'Nombre;Apellido;Texto en sobre;Cupo de invitados;Teléfono\nOrlando;;;3;7000-0000\n';

describe('POST /api/admin/guests/import', () => {
  it('rejectsARequestBodyThatIsNotAnObjectWithACsvString', async () => {
    const response = buildResponse();

    await handler(buildRequest('POST', { notCsv: true }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ code: 'INVALID_PAYLOAD' });
    expect(importGuests).not.toHaveBeenCalled();
  });

  it('rejectsAnInvalidCsvRowWithoutWritingAnythingAndReportsTheRowNumber', async () => {
    const response = buildResponse();
    const invalidCsv = `${HUMAN_HEADER}\nOrlando,,,,\n`;

    await handler(buildRequest('POST', { csv: invalidCsv }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    const [body] = response.json.mock.calls[0] as [{ code: string; errors: { row: number }[] }];
    expect(body.code).toBe('INVALID_CSV');
    expect(body.errors[0]?.row).toBe(2);
    expect(importGuests).not.toHaveBeenCalled();
  });

  it('rejectsAMalformedHeaderWithoutWritingAnything', async () => {
    const response = buildResponse();

    await handler(buildRequest('POST', { csv: 'a,b,c\n1,2,3\n' }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(importGuests).not.toHaveBeenCalled();
  });

  it('rejectsTheMachineReadableEnglishHeaderBecauseTheConsoleExpectsTheHumanOne', async () => {
    const response = buildResponse();
    const englishCsv = 'firstName,lastName,titleLabel,guestLimit,phone\nOrlando,,,3,+50370000000\n';

    await handler(buildRequest('POST', { csv: englishCsv }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(importGuests).not.toHaveBeenCalled();
  });

  it('importsValidRowsAndReturnsTheImportedAndSkippedCounts', async () => {
    vi.mocked(importGuests).mockResolvedValue({ imported: 1, skipped: 0 });
    const response = buildResponse();

    await handler(buildRequest('POST', { csv: VALID_CSV }), response);

    expect(importGuests).toHaveBeenCalledWith([
      expect.objectContaining({ firstName: 'Orlando', phone: '+50370000000' }),
    ]);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ imported: 1, skipped: 0 });
  });

  it('acceptsASemicolonDelimitedCsvLikeExcelExportsInSpanishRegionalSettings', async () => {
    vi.mocked(importGuests).mockResolvedValue({ imported: 1, skipped: 0 });
    const response = buildResponse();

    await handler(buildRequest('POST', { csv: VALID_SEMICOLON_CSV }), response);

    expect(importGuests).toHaveBeenCalledWith([
      expect.objectContaining({ firstName: 'Orlando', phone: '+50370000000' }),
    ]);
    expect(response.status).toHaveBeenCalledWith(200);
  });
});

describe('unsupported methods on /api/admin/guests/import', () => {
  it('respondsWithMethodNotAllowedForAnythingElse', async () => {
    const response = buildResponse();

    await handler(buildRequest('GET'), response);

    expect(response.status).toHaveBeenCalledWith(405);
    expect(response.json).toHaveBeenCalledWith({ code: 'METHOD_NOT_ALLOWED' });
  });
});
