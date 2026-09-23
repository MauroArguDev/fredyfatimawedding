import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useImportGuestsMutation } from '@/components/admin/guests/useImportGuestsMutation';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { GuestImportValidationError } from '@/components/admin/guests/adminGuestsApiError';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

function createWrapper(queryClient: QueryClient) {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

const CSV = 'Nombre,Apellido,Texto en sobre,Cupo de invitados,Teléfono\nOrlando,,,3,7000-0000\n';

describe('useImportGuestsMutation', () => {
  it('postsTheCsvTextToTheImportEndpoint', async () => {
    const queryClient = new QueryClient();
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ imported: 1, skipped: 0 }), { status: 200 }),
    );

    const { result } = renderHook(() => useImportGuestsMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate(CSV);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith(
      '/api/admin/guests/import',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ csv: CSV }) }),
    );
    expect(result.current.data).toEqual({ imported: 1, skipped: 0 });
  });

  it('rejectsWithAGuestImportValidationErrorWhenTheServerReportsRowErrors', async () => {
    const queryClient = new QueryClient();
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'INVALID_CSV', errors: [{ row: 2, message: 'boom' }] }), {
        status: 400,
      }),
    );

    const { result } = renderHook(() => useImportGuestsMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate(CSV);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(GuestImportValidationError);
  });
});
