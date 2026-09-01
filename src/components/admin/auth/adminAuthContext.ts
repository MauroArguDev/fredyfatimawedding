import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AdminAuthContextValue {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
}

export const adminAuthContext = createContext<AdminAuthContextValue | null>(null);
