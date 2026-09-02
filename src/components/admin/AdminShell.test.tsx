import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminShell } from '@/components/admin/AdminShell';
import { adminShellCopy } from '@/content/appShell';

beforeEach(() => {
  window.localStorage.clear();
});

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

  it('togglesDarkModeAndUpdatesTheButtonLabelWhenClicked', async () => {
    const { container } = render(
      <AdminShell title="Panel de administración" logoutLabel="Cerrar sesión" onLogout={vi.fn()}>
        <p>Contenido</p>
      </AdminShell>,
    );
    const root = container.querySelector('.admin-shell');
    expect(root).not.toBeNull();
    expect(root).not.toHaveClass('dark');

    await userEvent.click(screen.getByRole('button', { name: adminShellCopy.switchToDarkTheme }));

    expect(root).toHaveClass('dark');
    expect(
      screen.getByRole('button', { name: adminShellCopy.switchToLightTheme }),
    ).toBeInTheDocument();
  });
});
