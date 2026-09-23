import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RsvpConfirmModal } from '@/components/ui/RsvpConfirmModal';
import { rsvpConfirmModalCopy } from '@/content/rsvp';

describe('RsvpConfirmModal', () => {
  it('givesTheCancelAndConfirmButtonsEqualWidthAndCentersTheRowBetweenThem', () => {
    render(
      <RsvpConfirmModal
        isOpen
        count={2}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: rsvpConfirmModalCopy.cancelLabel });
    const confirmButton = screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel });
    const row = cancelButton.parentElement;

    expect(row?.className).toContain('justify-center');
    expect(cancelButton.className).toContain('flex-1');
    expect(confirmButton.className).toContain('flex-1');
  });
});
