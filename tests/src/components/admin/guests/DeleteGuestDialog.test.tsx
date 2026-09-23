import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeleteGuestDialog } from '@/components/admin/guests/DeleteGuestDialog';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { deleteGuestDialogCopy } from '@/content/adminGuestActions';
import { adminGuestToastCopy } from '@/content/adminGuestForm';
import type { AdminGuest } from '@/schemas/guest';

const { toastSuccessMock } = vi.hoisted(() => ({ toastSuccessMock: vi.fn() }));

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: toastSuccessMock, error: vi.fn() } }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

const orlando: AdminGuest = {
  id: 'id-1',
  token: 'V1StGXR8_Z5jdHi6B-myT',
  firstName: 'Orlando',
  lastName: 'Martínez',
  titleLabel: null,
  guestLimit: 3,
  phone: '+50370000000',
  confirmed: false,
  confirmedCount: 0,
  confirmedAt: null,
  firstOpenedAt: null,
  invitedAt: null,
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
};

function renderDialog(guest: AdminGuest | null, onClose = vi.fn()) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <DeleteGuestDialog guest={guest} onClose={onClose} />
    </QueryClientProvider>,
  );
}

describe('DeleteGuestDialog', () => {
  it('doesNotRenderWhenThereIsNoGuest', () => {
    renderDialog(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('showsTheGuestsNameInTheConfirmationBody', () => {
    renderDialog(orlando);

    expect(screen.getByText(/Orlando Martínez/)).toBeInTheDocument();
  });

  it('deletesTheGuestAndClosesOnConfirm', async () => {
    const onClose = vi.fn();
    fetchAdminApiMock.mockResolvedValue(new Response(null, { status: 204 }));
    renderDialog(orlando, onClose);

    await userEvent.click(screen.getByRole('button', { name: deleteGuestDialogCopy.confirm }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith('/api/admin/guests/id-1', { method: 'DELETE' });
    expect(toastSuccessMock).toHaveBeenCalledWith(adminGuestToastCopy.deleted);
  });

  it('showsAReadableErrorWhenTheServerRejectsTheDeletion', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404 }),
    );
    renderDialog(orlando);

    await userEvent.click(screen.getByRole('button', { name: deleteGuestDialogCopy.confirm }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
