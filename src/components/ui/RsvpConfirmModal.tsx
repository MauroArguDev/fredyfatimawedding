import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { rsvpConfirmModalCopy } from '@/content/rsvp';

interface RsvpConfirmModalProps {
  isOpen: boolean;
  count: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const RsvpConfirmModal = ({
  isOpen,
  count,
  isSubmitting,
  onClose,
  onConfirm,
}: RsvpConfirmModalProps): ReactNode => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    titleId={rsvpConfirmModalCopy.titleId}
    title={rsvpConfirmModalCopy.title}
  >
    <p className="mt-2">{rsvpConfirmModalCopy.body(count)}</p>
    <div className="mt-4 flex justify-end gap-3">
      <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onClose}>
        {rsvpConfirmModalCopy.cancelLabel}
      </Button>
      <Button
        type="button"
        isLoading={isSubmitting}
        loadingLabel={rsvpConfirmModalCopy.confirmingLabel}
        onClick={onConfirm}
      >
        {rsvpConfirmModalCopy.confirmLabel}
      </Button>
    </div>
  </Modal>
);
