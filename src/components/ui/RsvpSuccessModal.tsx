import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatGuestCountSummary, rsvpSuccessCopy } from '@/content/rsvp';

interface RsvpSuccessModalProps {
  isOpen: boolean;
  count: number;
  waLink: string;
  onClose: () => void;
}

export const RsvpSuccessModal = ({
  isOpen,
  count,
  waLink,
  onClose,
}: RsvpSuccessModalProps): ReactNode => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    titleId={rsvpSuccessCopy.titleId}
    title={rsvpSuccessCopy.heading}
  >
    <p className="mt-2">{formatGuestCountSummary(count)}</p>
    <div className="mt-4 flex flex-col items-center gap-3">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-invitation-sm bg-surface-sage px-6 py-3 text-center font-bold text-text-on-sage shadow-[0_10px_14px_0_rgba(0,0,0,0.3)]"
      >
        {rsvpSuccessCopy.whatsappButtonLabel}
      </a>
      <Button type="button" variant="secondary" onClick={onClose}>
        {rsvpSuccessCopy.closeLabel}
      </Button>
    </div>
  </Modal>
);
