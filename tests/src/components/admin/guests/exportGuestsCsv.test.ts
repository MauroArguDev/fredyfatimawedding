import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadGuestsExport } from '@/components/admin/guests/exportGuestsCsv';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { GUEST_EXPORT_FILENAME } from '@/content/guestExport';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(URL, 'createObjectURL');
  Reflect.deleteProperty(URL, 'revokeObjectURL');
});

describe('downloadGuestsExport', () => {
  it('fetchesTheExportEndpointAndTriggersADownloadOfTheExpectedFile', async () => {
    fetchAdminApiMock.mockResolvedValue(new Response('a,b\n1,2', { status: 200 }));
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    await downloadGuestsExport();

    expect(fetchAdminApi).toHaveBeenCalledWith('/api/admin/export');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const anchor = clickSpy.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe(GUEST_EXPORT_FILENAME);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('rejectsWithAReadableErrorWhenTheServerDeniesTheExport', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401 }),
    );

    await expect(downloadGuestsExport()).rejects.toThrow();
  });
});
