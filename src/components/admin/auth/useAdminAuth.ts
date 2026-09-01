import { useContext } from 'react';
import {
  adminAuthContext,
  type AdminAuthContextValue,
} from '@/components/admin/auth/adminAuthContext';

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(adminAuthContext);

  if (context === null) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }

  return context;
}
