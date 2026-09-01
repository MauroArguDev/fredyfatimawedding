import type { ReactNode } from 'react';
import { Button } from '@/components/admin/primitives/button';
import { FieldError } from '@/components/admin/primitives/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin/primitives/dialog';
import { useUpdateGuestMutation } from '@/components/admin/guests/useUpdateGuestMutation';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { notifyOnSuccess } from '@/components/admin/guests/closeAndNotify';
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
  const serverErrorMessage = resolveAdminApiErrorMessage(mutation.error);

  const handleConfirm = (): void => {
    if (guest === null) {
      return;
    }

    mutation.mutate(
      { id: guest.id, patch: { confirmed: false } },
      { onSuccess: notifyOnSuccess(onClose, adminGuestToastCopy.released) },
    );
  };

  return (
    <Dialog
      open={guest !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{releaseConfirmationDialogCopy.title}</DialogTitle>
        </DialogHeader>
        {guest !== null && (
          <p>{releaseConfirmationDialogCopy.body.replace('{name}', resolveDisplayName(guest))}</p>
        )}
        {serverErrorMessage !== null && <FieldError>{serverErrorMessage}</FieldError>}
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending
              ? releaseConfirmationDialogCopy.confirming
              : releaseConfirmationDialogCopy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
