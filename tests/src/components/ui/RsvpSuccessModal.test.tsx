import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RsvpSuccessModal } from '@/components/ui/RsvpSuccessModal';
import {
  brideConfirmationWhatsAppLink,
  groomConfirmationWhatsAppLink,
  rsvpSuccessCopy,
} from '@/content/rsvp';

describe('RsvpSuccessModal', () => {
  it('offersOneWhatsappButtonPerFianceAlongsideClose', () => {
    render(<RsvpSuccessModal isOpen count={2} onClose={vi.fn()} />);

    expect(screen.getByRole('link', { name: rsvpSuccessCopy.notifyGroomLabel })).toHaveAttribute(
      'href',
      groomConfirmationWhatsAppLink,
    );
    expect(screen.getByRole('link', { name: rsvpSuccessCopy.notifyBrideLabel })).toHaveAttribute(
      'href',
      brideConfirmationWhatsAppLink,
    );
    expect(screen.getByRole('button', { name: rsvpSuccessCopy.closeLabel })).toBeInTheDocument();
  });

  it('stretchesAllThreeCallToActionsToTheSameWidthByLeavingTheColumnAtItsDefaultStretchAlignment', () => {
    render(<RsvpSuccessModal isOpen count={2} onClose={vi.fn()} />);

    const groomLink = screen.getByRole('link', { name: rsvpSuccessCopy.notifyGroomLabel });
    const column = groomLink.parentElement;

    expect(column?.className).toContain('flex-col');
    expect(column?.className).not.toContain('items-center');
  });
});
