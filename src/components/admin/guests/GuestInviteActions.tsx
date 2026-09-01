import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/admin/primitives/button';
import { useUpdateGuestMutation } from '@/components/admin/guests/useUpdateGuestMutation';
import {
  buildGuestWhatsAppLink,
  buildInvitationUrl,
} from '@/components/admin/guests/buildGuestInviteLink';
import { adminGuestInviteCopy, buildGuestInviteMessage } from '@/content/adminGuestInvite';
import type { AdminGuest } from '@/schemas/guest';

interface GuestInviteActionsProps {
  guest: AdminGuest;
}

async function copyInvitationLink(link: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(link);
    toast.success(adminGuestInviteCopy.copySuccess);
  } catch {
    toast.error(adminGuestInviteCopy.copyError);
  }
}

export const GuestInviteActions = ({ guest }: GuestInviteActionsProps): ReactNode => {
  const mutation = useUpdateGuestMutation();
  const link = buildInvitationUrl(window.location.origin, guest.token);

  const handleSend = (): void => {
    const message = buildGuestInviteMessage(guest.firstName, link);
    window.open(buildGuestWhatsAppLink(guest.phone, message), '_blank', 'noopener,noreferrer');
    mutation.mutate({ id: guest.id, patch: { invitedAt: new Date() } });
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleSend}>
        {adminGuestInviteCopy.sendButton}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          void copyInvitationLink(link);
        }}
      >
        {adminGuestInviteCopy.copyButton}
      </Button>
    </>
  );
};
