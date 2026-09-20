import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvelopeGate } from '@/components/ui/EnvelopeGate';

const OPEN_ANIMATION_TIMEOUT_MS = 2500;

describe('EnvelopeGate', () => {
  it('isARealButtonWithADescriptiveAccessibleName', () => {
    render(<EnvelopeGate titleLabel="Tío Orlando y Familia." onOpen={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: 'Toca para abrir la invitación de Tío Orlando y Familia.',
    });
    expect(button.tagName).toBe('BUTTON');
  });

  it('callsOnOpenOnceTheOpeningAnimationFinishes', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={onOpen} />);

    await user.click(screen.getByRole('button'));

    await waitFor(
      () => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      },
      { timeout: OPEN_ANIMATION_TIMEOUT_MS },
    );
  });

  it('isOperableWithTheKeyboard', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={onOpen} />);

    await user.tab();
    await user.keyboard('{Enter}');

    await waitFor(
      () => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      },
      { timeout: OPEN_ANIMATION_TIMEOUT_MS },
    );
  });

  it('ignoresASecondTapWhileAlreadyOpeningSoOnOpenNeverFiresTwice', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={onOpen} />);

    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);
    await user.click(button);

    await waitFor(
      () => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      },
      { timeout: OPEN_ANIMATION_TIMEOUT_MS },
    );
  });

  it('disablesTheButtonWhileOpeningSoItCannotBeReactivatedByTheKeyboardEither', async () => {
    const user = userEvent.setup();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={vi.fn()} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(button).toBeDisabled();
  });
});
