import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminShell } from '@/components/admin/AdminShell';

describe('AdminShell', () => {
  it('rendersTheTitleAndChildren', () => {
    render(
      <AdminShell title="Panel de administración" logoutLabel="Cerrar sesión" onLogout={vi.fn()}>
        <p>Contenido</p>
      </AdminShell>,
    );

    expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(document.querySelector('section[aria-live="polite"]')).toBeInTheDocument();
  });

  it('callsOnLogoutWhenTheLogoutButtonIsClicked', async () => {
    const onLogout = vi.fn();

    render(
      <AdminShell title="Panel de administración" logoutLabel="Cerrar sesión" onLogout={onLogout}>
        <p>Contenido</p>
      </AdminShell>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
