import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateGuestMutation } from '@/components/admin/guests/useCreateGuestMutation';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import type { AdminGuestListResponse, CreateGuestInput } from '@/schemas/guest';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

const input: CreateGuestInput = {
  firstName: 'Orlando',
  lastName: null,
  titleLabel: null,
  guestLimit: 3,
  phone: '+50370000000',
};

const emptyList: AdminGuestListResponse = {
  guests: [],
  stats: { total: 0, confirmed: 0, pending: 0, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
};

function createWrapper(queryClient: QueryClient) {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

describe('useCreateGuestMutation', () => {
  it('optimisticallyAddsTheGuestBeforeTheResponseArrives', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, emptyList);
    fetchAdminApiMock.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useCreateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate(input);

    await waitFor(() => {
      const cached = queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY);
      expect(cached?.guests).toHaveLength(1);
    });
    expect(
      queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY)?.stats.total,
    ).toBe(1);
  });

  it('rollsBackTheOptimisticGuestWhenTheRequestFails', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, emptyList);
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'INVALID_PAYLOAD' }), { status: 400 }),
    );

    const { result } = renderHook(() => useCreateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate(input);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY)).toEqual(
      emptyList,
    );
  });

  it('sendsThePayloadAsJsonToTheCreateEndpoint', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, emptyList);
    const createdGuest = {
      id: 'new-id',
      token: 'V1StGXR8_Z5jdHi6B-myT',
      ...input,
      confirmed: false,
      confirmedCount: 0,
      confirmedAt: null,
      firstOpenedAt: null,
      invitedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify(createdGuest), { status: 201 }),
    );

    const { result } = renderHook(() => useCreateGuestMutation(), {
      wrapper: createWrapper(queryClient),
    });
    result.current.mutate(input);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith(
      '/api/admin/guests',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
    );
  });
});
