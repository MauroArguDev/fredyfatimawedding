import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { readAdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import { adminGuestListResponseSchema, type AdminGuestListResponse } from '@/schemas/guest';

async function fetchAdminGuests(): Promise<AdminGuestListResponse> {
  const response = await fetchAdminApi('/api/admin/guests');

  if (!response.ok) {
    throw await readAdminGuestsApiError(response);
  }

  return adminGuestListResponseSchema.parse(await response.json());
}

export function useAdminGuests(): UseQueryResult<AdminGuestListResponse> {
  return useQuery({
    queryKey: ADMIN_GUESTS_QUERY_KEY,
    queryFn: fetchAdminGuests,
  });
}
