import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/components/admin/auth/firebaseClient';
import {
  adminAuthContext,
  type AdminAuthContextValue,
} from '@/components/admin/auth/adminAuthContext';

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps): ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
  }, []);

  const value: AdminAuthContextValue = {
    user,
    initializing,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOutAdmin: async () => {
      await signOut(auth);
    },
  };

  return <adminAuthContext.Provider value={value}>{children}</adminAuthContext.Provider>;
};
