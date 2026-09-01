import { AdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { resolveAdminGuestErrorMessage } from '@/content/adminGuestForm';

export function resolveMutationErrorMessage(error: unknown): string | null {
  if (error === null) {
    return null;
  }

  const code = error instanceof AdminGuestsApiError ? error.code : 'UNKNOWN';

  return resolveAdminGuestErrorMessage(code);
}
