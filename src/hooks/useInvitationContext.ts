import { useContext } from 'react';
import { invitationContext, type InvitationContextValue } from '@/hooks/invitationContext';

export function useInvitationContext(): InvitationContextValue {
  const context = useContext(invitationContext);

  if (context === null) {
    throw new Error('useInvitationContext must be used within an InvitationProvider');
  }

  return context;
}
