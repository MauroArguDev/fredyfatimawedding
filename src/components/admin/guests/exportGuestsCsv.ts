import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { readAdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { GUEST_EXPORT_FILENAME } from '@/content/guestExport';

export async function downloadGuestsExport(): Promise<void> {
  const response = await fetchAdminApi('/api/admin/export');

  if (!response.ok) {
    throw await readAdminGuestsApiError(response);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = GUEST_EXPORT_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
