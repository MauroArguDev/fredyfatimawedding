import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvelopeGate } from '@/components/ui/EnvelopeGate';

describe('EnvelopeGate', () => {
  it('isARealButtonWithADescriptiveAccessibleName', () => {
    render(<EnvelopeGate titleLabel="Tío Orlando y Familia." onOpen={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: 'Toca para abrir la invitación de Tío Orlando y Familia.',
    });
    expect(button.tagName).toBe('BUTTON');
  });

  it('callsOnOpenWhenClicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={onOpen} />);

    await user.click(screen.getByRole('button'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('isOperableWithTheKeyboard', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<EnvelopeGate titleLabel="Orlando" onOpen={onOpen} />);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
