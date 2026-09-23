import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  brideConfirmationWhatsAppLink,
  formatGuestCountSummary,
  groomConfirmationWhatsAppLink,
  rsvpSuccessCopy,
} from '@/content/rsvp';

interface RsvpSuccessModalProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
}

const WHATSAPP_BUTTON_CLASS =
  'rounded-invitation-sm bg-surface-sage px-6 py-3 text-center font-bold text-text-on-sage shadow-[0_10px_14px_0_rgba(0,0,0,0.3)]';

export const RsvpSuccessModal = ({ isOpen, count, onClose }: RsvpSuccessModalProps): ReactNode => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    titleId={rsvpSuccessCopy.titleId}
    title={rsvpSuccessCopy.heading}
  >
    <p className="mt-2">{formatGuestCountSummary(count)}</p>
    <div className="mt-4 flex flex-col gap-3">
      <a
        href={groomConfirmationWhatsAppLink}
        target="_blank"
        rel="noopener noreferrer"
        className={WHATSAPP_BUTTON_CLASS}
      >
        {rsvpSuccessCopy.notifyGroomLabel}
      </a>
      <a
        href={brideConfirmationWhatsAppLink}
        target="_blank"
        rel="noopener noreferrer"
        className={WHATSAPP_BUTTON_CLASS}
      >
        {rsvpSuccessCopy.notifyBrideLabel}
      </a>
      <Button type="button" variant="secondary" className="text-center" onClick={onClose}>
        {rsvpSuccessCopy.closeLabel}
      </Button>
    </div>
  </Modal>
);
