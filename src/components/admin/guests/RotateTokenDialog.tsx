import type { ReactNode } from 'react';
import { ConfirmGuestActionDialog } from '@/components/admin/guests/ConfirmGuestActionDialog';
import { useRotateTokenMutation } from '@/components/admin/guests/useRotateTokenMutation';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import {
  closeWhenClosed,
  notifyOnError,
  notifyOnSuccess,
} from '@/components/admin/guests/closeAndNotify';
import { rotateTokenDialogCopy } from '@/content/adminGuestActions';
import { adminGuestToastCopy } from '@/content/adminGuestForm';
import { resolveDisplayName, type AdminGuest } from '@/schemas/guest';

interface RotateTokenDialogProps {
  guest: AdminGuest | null;
  onClose: () => void;
}

export const RotateTokenDialog = ({ guest, onClose }: RotateTokenDialogProps): ReactNode => {
  const mutation = useRotateTokenMutation();

  const handleConfirm = (): void => {
    if (guest === null) {
      return;
    }

    mutation.mutate(guest.id, {
      onSuccess: notifyOnSuccess(onClose, adminGuestToastCopy.tokenRotated),
      onError: notifyOnError(),
    });
  };

  return (
    <ConfirmGuestActionDialog
      open={guest !== null}
      onOpenChange={closeWhenClosed(onClose)}
      title={rotateTokenDialogCopy.title}
      body={
        guest !== null && (
          <p>{rotateTokenDialogCopy.body.replace('{name}', resolveDisplayName(guest))}</p>
        )
      }
      errorMessage={resolveAdminApiErrorMessage(mutation.error)}
      confirmLabel={rotateTokenDialogCopy.confirm}
      confirmingLabel={rotateTokenDialogCopy.confirming}
      isPending={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
};
