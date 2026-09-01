import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import type { AdminGuestListResponse } from '@/schemas/guest';
import { readAdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import {
  applyOptimisticGuestsUpdate,
  restoreGuestsSnapshot,
  withoutGuest,
} from '@/components/admin/guests/adminGuestsOptimisticUpdate';

async function deleteGuestOnServer(id: string): Promise<void> {
  const response = await fetchAdminApi(`/api/admin/guests/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    throw await readAdminGuestsApiError(response);
  }
}

export function useDeleteGuestMutation(): UseMutationResult<
  void,
  Error,
  string,
  { previous: AdminGuestListResponse | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGuestOnServer,
    onMutate: async (id) => {
      const previous = await applyOptimisticGuestsUpdate(queryClient, (data) =>
        withoutGuest(data, id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      restoreGuestsSnapshot(queryClient, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GUESTS_QUERY_KEY });
    },
  });
}
