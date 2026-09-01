import { createContext } from 'react';
import type { PublicInvitation } from '@/schemas/guest';

export interface InvitationContextValue {
  displayName: string;
  guestLimit: number;
  confirmed: boolean;
  confirmedCount: number;
  rsvpOpen: boolean;
}

export const invitationContext = createContext<InvitationContextValue | null>(null);

export function toInvitationContextValue(invitation: PublicInvitation): InvitationContextValue {
  return {
    displayName: invitation.titleLabel ?? invitation.firstName,
    guestLimit: invitation.guestLimit,
    confirmed: invitation.confirmed,
    confirmedCount: invitation.confirmedCount,
    rsvpOpen: invitation.rsvpOpen,
  };
}
