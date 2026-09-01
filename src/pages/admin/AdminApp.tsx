import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin/auth/AdminAuthProvider';
import { RequireAdminAuth } from '@/components/admin/auth/RequireAdminAuth';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';
import { AdminGuestsPage } from '@/components/admin/guests/AdminGuestsPage';
import { adminShellCopy } from '@/content/appShell';

const AdminConsole = (): ReactNode => {
  const { signOutAdmin } = useAdminAuth();

  return (
    <AdminShell
      title={adminShellCopy.title}
      logoutLabel={adminShellCopy.logout}
      onLogout={() => {
        void signOutAdmin();
      }}
    >
      <AdminGuestsPage />
    </AdminShell>
  );
};

const AdminApp = (): ReactNode => {
  return (
    <AdminAuthProvider>
      <RequireAdminAuth>
        <AdminConsole />
      </RequireAdminAuth>
    </AdminAuthProvider>
  );
};

export default AdminApp;
