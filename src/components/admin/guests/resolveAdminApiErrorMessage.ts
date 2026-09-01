import { AdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { resolveAdminGuestErrorMessage } from '@/content/adminGuestForm';

export function resolveAdminApiErrorMessage(error: unknown): string | null {
  if (error === null) {
    return null;
  }

  if (error instanceof AdminGuestsApiError) {
    return resolveAdminGuestErrorMessage(error.code);
  }

  if (error instanceof TypeError) {
    return resolveAdminGuestErrorMessage('NETWORK');
  }

  return resolveAdminGuestErrorMessage('UNKNOWN');
}
