import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateGuestMutation } from '@/components/admin/guests/useUpdateGuestMutation';
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
  notes: null,
  confirmed: true,
  confirmedCount: 2,
  confirmedAt: new Date('2026-08-01'),
  firstOpenedAt: new Date('2026-08-01'),
  invitedAt: null,
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
};

const listWithOrlando: AdminGuestListResponse = {
  guests: [orlando],
  stats: { total: 1, confirmed: 1, pending: 0, openedNotConfirmed: 0, totalConfirmedPeople: 2 },
};

function createWrapper(queryClient: QueryClient) {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

describe('useUpdateGuestMutation', () => {
  it('optimisticallyPatchesTheMatchingGuest', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useUpdateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate({ id: 'id-1', patch: { confirmedCount: 1 } });

    await waitFor(() => {
      const cached = queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY);
      expect(cached?.guests[0]?.confirmedCount).toBe(1);
    });
  });

  it('supportsReleasingAConfirmationByPatchingConfirmedToFalse', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useUpdateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate({ id: 'id-1', patch: { confirmed: false } });

    await waitFor(() => {
      const cached = queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY);
      expect(cached?.guests[0]?.confirmed).toBe(false);
    });
  });

  it('rollsBackTheOptimisticPatchWhenTheRequestFails', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT' }), { status: 400 }),
    );

    const { result } = renderHook(() => useUpdateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate({ id: 'id-1', patch: { guestLimit: 1 } });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY)).toEqual(
      listWithOrlando,
    );
  });

  it('sendsAPatchRequestToTheGuestsIdEndpoint', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, listWithOrlando);
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ ...orlando, notes: 'x' }), { status: 200 }),
    );

    const { result } = renderHook(() => useUpdateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate({ id: 'id-1', patch: { notes: 'x' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith(
      '/api/admin/guests/id-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
