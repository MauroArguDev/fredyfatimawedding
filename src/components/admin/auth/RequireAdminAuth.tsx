import type { ReactNode } from 'react';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';
import { LoginPage } from '@/components/admin/auth/LoginPage';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { adminAuthLoadingCopy } from '@/content/adminAuth';

interface RequireAdminAuthProps {
  children: ReactNode;
}

export const RequireAdminAuth = ({ children }: RequireAdminAuthProps): ReactNode => {
  const { user, initializing } = useAdminAuth();

  if (initializing) {
    return <AdminLoadingState message={adminAuthLoadingCopy.checkingSession} />;
  }

  if (user === null) {
    return <LoginPage />;
  }

  return children;
};
