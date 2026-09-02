import type { ReactNode } from 'react';
import { ConfirmGuestActionDialog } from '@/components/admin/guests/ConfirmGuestActionDialog';
import { useDeleteGuestMutation } from '@/components/admin/guests/useDeleteGuestMutation';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { notifyOnSuccess } from '@/components/admin/guests/closeAndNotify';
import { deleteGuestDialogCopy } from '@/content/adminGuestActions';
import { adminGuestToastCopy } from '@/content/adminGuestForm';
import { resolveDisplayName, type AdminGuest } from '@/schemas/guest';

interface DeleteGuestDialogProps {
  guest: AdminGuest | null;
  onClose: () => void;
}

export const DeleteGuestDialog = ({ guest, onClose }: DeleteGuestDialogProps): ReactNode => {
  const mutation = useDeleteGuestMutation();

  const handleConfirm = (): void => {
    if (guest === null) {
      return;
    }

    mutation.mutate(guest.id, { onSuccess: notifyOnSuccess(onClose, adminGuestToastCopy.deleted) });
  };

  return (
    <ConfirmGuestActionDialog
      open={guest !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      title={deleteGuestDialogCopy.title}
      body={
        guest !== null && (
          <p>{deleteGuestDialogCopy.body.replace('{name}', resolveDisplayName(guest))}</p>
        )
      }
      errorMessage={resolveAdminApiErrorMessage(mutation.error)}
      confirmLabel={deleteGuestDialogCopy.confirm}
      confirmingLabel={deleteGuestDialogCopy.confirming}
      isPending={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
};
