import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteGuestMutation } from '@/components/admin/guests/useDeleteGuestMutation';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import type { AdminGuest, AdminGuestListResponse } from '@/schemas/guest';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

const orlando: AdminGuest = {
  id: 'id-1',
  token: 'V1StGXR8_Z5jdHi6B-myT',
  firstName: 'Orlando',
  lastName: null,
  titleLabel: null,
  guestLimit: 3,
  phone: '+50370000000',
  confirmed: false,
  confirmedCount: 0,
  confirmedAt: null,
  firstOpenedAt: null,
  invitedAt: null,
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
};

const listWithOrlando: AdminGuestListResponse = {
  guests: [orlando],
  stats: { total: 1, confirmed: 0, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
};

function createWrapper(queryClient: QueryClient) {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

describe('useDeleteGuestMutation', () => {
  it('optimisticallyRemovesTheGuestBeforeTheResponseArrives', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useDeleteGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate('id-1');

    await waitFor(() => {
      const cached = queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY);
      expect(cached?.guests).toHaveLength(0);
    });
  });

  it('rollsBackWhenTheDeleteRequestFails', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404 }),
    );

    const { result } = renderHook(() => useDeleteGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate('id-1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY)).toEqual(
      listWithOrlando,
    );
  });

  it('sendsADeleteRequestToTheGuestsIdEndpoint', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockResolvedValue(new Response(null, { status: 204 }));

    const { result } = renderHook(() => useDeleteGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate('id-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith('/api/admin/guests/id-1', { method: 'DELETE' });
  });
});
