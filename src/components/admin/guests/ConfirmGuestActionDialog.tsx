import type { ReactNode } from 'react';
import { Button } from '@/components/admin/primitives/button';
import { PendingButtonLabel } from '@/components/admin/PendingButtonLabel';
import { FieldError } from '@/components/admin/primitives/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/admin/primitives/dialog';

interface ConfirmGuestActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: ReactNode;
  errorMessage: string | null;
  confirmLabel: string;
  confirmingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
}

export const ConfirmGuestActionDialog = ({
  open,
  onOpenChange,
  title,
  body,
  errorMessage,
  confirmLabel,
  confirmingLabel,
  isPending,
  onConfirm,
}: ConfirmGuestActionDialogProps): ReactNode => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {body}
      {errorMessage !== null && <FieldError>{errorMessage}</FieldError>}
      <DialogFooter>
        <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
          <PendingButtonLabel
            isPending={isPending}
            pendingLabel={confirmingLabel}
            label={confirmLabel}
          />
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
