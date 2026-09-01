import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import {
  adminGuestSchema,
  type AdminGuest,
  type AdminGuestListResponse,
  type UpdateGuestInput,
} from '@/schemas/guest';
import { readAdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import {
  applyOptimisticGuestsUpdate,
  restoreGuestsSnapshot,
  withPatchedGuest,
} from '@/components/admin/guests/adminGuestsOptimisticUpdate';

export interface UpdateGuestVariables {
  id: string;
  patch: UpdateGuestInput;
}

async function updateGuestOnServer({ id, patch }: UpdateGuestVariables): Promise<AdminGuest> {
  const response = await fetchAdminApi(`/api/admin/guests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw await readAdminGuestsApiError(response);
  }

  return adminGuestSchema.parse(await response.json());
}

export function useUpdateGuestMutation(): UseMutationResult<
  AdminGuest,
  Error,
  UpdateGuestVariables,
  { previous: AdminGuestListResponse | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGuestOnServer,
    onMutate: async ({ id, patch }) => {
      const previous = await applyOptimisticGuestsUpdate(queryClient, (data) =>
        withPatchedGuest(data, id, patch as Partial<AdminGuest>),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      restoreGuestsSnapshot(queryClient, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GUESTS_QUERY_KEY });
    },
  });
}
