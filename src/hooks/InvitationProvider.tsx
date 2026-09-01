import type { ReactNode } from 'react';
import { invitationContext, type InvitationContextValue } from '@/hooks/invitationContext';

interface InvitationProviderProps {
  value: InvitationContextValue;
  children: ReactNode;
}

export const InvitationProvider = ({ value, children }: InvitationProviderProps): ReactNode => {
  return <invitationContext.Provider value={value}>{children}</invitationContext.Provider>;
};
