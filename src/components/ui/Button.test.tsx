import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('rendersItsChildrenAndRespondsToClicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enviar</Button>);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isOperableWithTheKeyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enviar</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isDisabledAndShowsTheLoadingLabelWhileLoading', () => {
    render(
      <Button isLoading loadingLabel="Enviando…">
        Enviar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Enviando…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('appliesTheSecondaryVariantClasses', () => {
    render(<Button variant="secondary">Ver mapa</Button>);

    expect(screen.getByRole('button', { name: 'Ver mapa' })).toHaveClass('border-text-body');
  });
});
