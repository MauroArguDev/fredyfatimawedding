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
  const serverErrorMessage = resolveAdminApiErrorMessage(mutation.error);

  const handleConfirm = (): void => {
    if (guest === null) {
      return;
    }

    mutation.mutate(guest.id, { onSuccess: notifyOnSuccess(onClose, adminGuestToastCopy.deleted) });
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
          <DialogTitle>{deleteGuestDialogCopy.title}</DialogTitle>
        </DialogHeader>
        {guest !== null && (
          <p>{deleteGuestDialogCopy.body.replace('{name}', resolveDisplayName(guest))}</p>
        )}
        {serverErrorMessage !== null && <FieldError>{serverErrorMessage}</FieldError>}
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending ? deleteGuestDialogCopy.confirming : deleteGuestDialogCopy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
