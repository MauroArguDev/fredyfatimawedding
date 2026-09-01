import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminGuests } from '@/components/admin/guests/useAdminGuests';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

describe('useAdminGuests', () => {
  it('parsesTheGuestsAndStatsEnvelopeOnSuccess', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          guests: [],
          stats: {
            total: 0,
            confirmed: 0,
            pending: 0,
            openedNotConfirmed: 0,
            totalConfirmedPeople: 0,
          },
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useAdminGuests(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.stats.total).toBe(0);
    expect(fetchAdminApi).toHaveBeenCalledWith('/api/admin/guests');
  });

  it('rejectsOnAnUnexpectedResponseStatus', async () => {
    fetchAdminApiMock.mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useAdminGuests(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
