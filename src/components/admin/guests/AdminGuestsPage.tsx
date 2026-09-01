import type { ReactNode } from 'react';
import { useAdminGuests } from '@/components/admin/guests/useAdminGuests';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { AdminGuestsBrowser } from '@/components/admin/guests/AdminGuestsBrowser';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { adminGuestsPageCopy } from '@/content/adminGuests';

export const AdminGuestsPage = (): ReactNode => {
  const query = useAdminGuests();

  if (query.isPending) {
    return <AdminLoadingState message={adminGuestsPageCopy.loading} />;
  }

  if (query.isError) {
    return (
      <AdminErrorState
        message={resolveAdminApiErrorMessage(query.error) ?? adminGuestsPageCopy.errorMessage}
        retry={{
          label: adminGuestsPageCopy.retry,
          onRetry: () => {
            void query.refetch();
          },
        }}
      />
    );
  }

  return <AdminGuestsBrowser guests={query.data.guests} stats={query.data.stats} />;
};
