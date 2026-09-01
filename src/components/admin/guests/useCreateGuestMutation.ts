import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import {
  adminGuestSchema,
  type AdminGuest,
  type AdminGuestListResponse,
  type CreateGuestInput,
} from '@/schemas/guest';
import { readAdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import {
  applyOptimisticGuestsUpdate,
  restoreGuestsSnapshot,
  withAddedGuest,
} from '@/components/admin/guests/adminGuestsOptimisticUpdate';

async function createGuest(input: CreateGuestInput): Promise<AdminGuest> {
  const response = await fetchAdminApi('/api/admin/guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await readAdminGuestsApiError(response);
  }

  return adminGuestSchema.parse(await response.json());
}

function toOptimisticGuest(input: CreateGuestInput): AdminGuest {
  const now = new Date();

  return {
    ...input,
    id: `optimistic-${crypto.randomUUID()}`,
    token: '',
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    invitedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function useCreateGuestMutation(): UseMutationResult<
  AdminGuest,
  Error,
  CreateGuestInput,
  { previous: AdminGuestListResponse | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGuest,
    onMutate: async (input) => {
      const previous = await applyOptimisticGuestsUpdate(queryClient, (data) =>
        withAddedGuest(data, toOptimisticGuest(input)),
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      restoreGuestsSnapshot(queryClient, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GUESTS_QUERY_KEY });
    },
  });
}
