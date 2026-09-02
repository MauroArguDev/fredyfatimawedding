import type { ReactNode } from 'react';
import { ConfirmGuestActionDialog } from '@/components/admin/guests/ConfirmGuestActionDialog';
import { useUpdateGuestMutation } from '@/components/admin/guests/useUpdateGuestMutation';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import {
  closeWhenClosed,
  notifyOnError,
  notifyOnSuccess,
} from '@/components/admin/guests/closeAndNotify';
import { releaseConfirmationDialogCopy } from '@/content/adminGuestActions';
import { adminGuestToastCopy } from '@/content/adminGuestForm';
import { resolveDisplayName, type AdminGuest } from '@/schemas/guest';

interface ReleaseConfirmationDialogProps {
  guest: AdminGuest | null;
  onClose: () => void;
}

export const ReleaseConfirmationDialog = ({
  guest,
  onClose,
}: ReleaseConfirmationDialogProps): ReactNode => {
  const mutation = useUpdateGuestMutation();

  const handleConfirm = (): void => {
    if (guest === null) {
      return;
    }

    mutation.mutate(
      { id: guest.id, patch: { confirmed: false } },
      {
        onSuccess: notifyOnSuccess(onClose, adminGuestToastCopy.released),
        onError: notifyOnError(),
      },
    );
  };

  return (
    <ConfirmGuestActionDialog
      open={guest !== null}
      onOpenChange={closeWhenClosed(onClose)}
      title={releaseConfirmationDialogCopy.title}
      body={
        guest !== null && (
          <p>{releaseConfirmationDialogCopy.body.replace('{name}', resolveDisplayName(guest))}</p>
        )
      }
      errorMessage={resolveAdminApiErrorMessage(mutation.error)}
      confirmLabel={releaseConfirmationDialogCopy.confirm}
      confirmingLabel={releaseConfirmationDialogCopy.confirming}
      isPending={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
};
