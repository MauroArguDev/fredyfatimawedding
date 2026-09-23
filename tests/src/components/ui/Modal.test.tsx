import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

const ModalHarness = (): ReactNode => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Abrir
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        titleId="modal-title"
        title="Confirmar"
      >
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Confirmar envío
        </button>
      </Modal>
    </>
  );
};

describe('Modal', () => {
  it('doesNotOpenTheDialogWhileIsOpenIsFalse', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} titleId="t" title="Confirmar">
        Contenido
      </Modal>,
    );

    expect(screen.getByText('Confirmar').closest('dialog')).not.toHaveAttribute('open');
  });

  it('movesFocusInsideOnOpenAndReturnsItToTheTriggerOnClose', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await user.click(trigger);

    const confirmButton = screen.getByRole('button', { name: 'Confirmar envío' });
    expect(confirmButton).toHaveFocus();

    await user.click(confirmButton);

    expect(trigger).toHaveFocus();
  });

  it('closesOnEscapeAndCallsOnClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} titleId="t" title="Confirmar">
        <button type="button">Confirmar envío</button>
      </Modal>,
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closesWhenClickingTheBackdropButNotTheContent', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} titleId="t" title="Confirmar">
        <button type="button">Confirmar envío</button>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: 'Confirmar envío' }));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole('heading', { name: 'Confirmar' }).closest('dialog') as HTMLElement,
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
