import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { readGuestImportError } from '@/components/admin/guests/adminGuestsApiError';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';

const importGuestsResultSchema = z.object({
  imported: z.number().int().min(0),
  skipped: z.number().int().min(0),
});

export type ImportGuestsResult = z.infer<typeof importGuestsResultSchema>;

async function importGuestsOnServer(csv: string): Promise<ImportGuestsResult> {
  const response = await fetchAdminApi('/api/admin/guests/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv }),
  });

  if (!response.ok) {
    throw await readGuestImportError(response);
  }

  return importGuestsResultSchema.parse(await response.json());
}

export function useImportGuestsMutation(): UseMutationResult<ImportGuestsResult, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importGuestsOnServer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GUESTS_QUERY_KEY });
    },
  });
}
