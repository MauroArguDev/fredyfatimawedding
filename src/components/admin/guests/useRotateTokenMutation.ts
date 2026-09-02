import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { adminGuestSchema, type AdminGuest, type AdminGuestListResponse } from '@/schemas/guest';
import { readAdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import { withPatchedGuest } from '@/components/admin/guests/adminGuestsOptimisticUpdate';

async function rotateGuestTokenOnServer(id: string): Promise<AdminGuest> {
  const response = await fetchAdminApi(`/api/admin/guests/${id}/rotate-token`, { method: 'POST' });

  if (!response.ok) {
    throw await readAdminGuestsApiError(response);
  }

  return adminGuestSchema.parse(await response.json());
}

export function useRotateTokenMutation(): UseMutationResult<AdminGuest, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rotateGuestTokenOnServer,
    onSuccess: (guest) => {
      queryClient.setQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY, (previous) =>
        previous === undefined ? previous : withPatchedGuest(previous, guest.id, guest),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GUESTS_QUERY_KEY });
    },
  });
}
