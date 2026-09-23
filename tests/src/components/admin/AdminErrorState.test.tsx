import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminErrorState } from '@/components/admin/AdminErrorState';

describe('AdminErrorState', () => {
  it('rendersTheMessageWithAnAlertRole', () => {
    render(<AdminErrorState message="Algo salió mal" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
  });

  it('omitsTheRetryButtonWhenNoRetryIsProvided', () => {
    render(<AdminErrorState message="Algo salió mal" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('callsOnRetryWhenTheRetryButtonIsClicked', async () => {
    const onRetry = vi.fn();

    render(<AdminErrorState message="Algo salió mal" retry={{ label: 'Reintentar', onRetry }} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
