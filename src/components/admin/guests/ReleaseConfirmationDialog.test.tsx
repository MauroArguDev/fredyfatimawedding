import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReleaseConfirmationDialog } from '@/components/admin/guests/ReleaseConfirmationDialog';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { releaseConfirmationDialogCopy } from '@/content/adminGuestActions';
import { adminGuestToastCopy } from '@/content/adminGuestForm';
import type { AdminGuest } from '@/schemas/guest';

const { toastSuccessMock } = vi.hoisted(() => ({ toastSuccessMock: vi.fn() }));

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: toastSuccessMock, error: vi.fn() } }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

const fatima: AdminGuest = {
  id: 'id-2',
  token: 'V1StGXR8_Z5jdHi6B-myT',
  firstName: 'Fátima',
  lastName: null,
  titleLabel: null,
  guestLimit: 3,
  phone: '+50370000000',
  notes: null,
  confirmed: true,
  confirmedCount: 2,
  confirmedAt: new Date('2026-08-01'),
  firstOpenedAt: new Date('2026-08-01'),
  invitedAt: null,
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
};

function renderDialog(guest: AdminGuest | null, onClose = vi.fn()) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ReleaseConfirmationDialog guest={guest} onClose={onClose} />
    </QueryClientProvider>,
  );
}

describe('ReleaseConfirmationDialog', () => {
  it('doesNotRenderWhenThereIsNoGuest', () => {
    renderDialog(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('warnsThatTheGuestWillBeAbleToResubmit', () => {
    renderDialog(fatima);

    expect(screen.getByText(/podrá volver a enviar el formulario/)).toBeInTheDocument();
  });

  it('patchesConfirmedToFalseAndClosesOnConfirm', async () => {
    const onClose = vi.fn();
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ ...fatima, confirmed: false }), { status: 200 }),
    );
    renderDialog(fatima, onClose);

    await userEvent.click(
      screen.getByRole('button', { name: releaseConfirmationDialogCopy.confirm }),
    );

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    const [, init] = vi.mocked(fetchAdminApi).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ confirmed: false });
    expect(toastSuccessMock).toHaveBeenCalledWith(adminGuestToastCopy.released);
  });

  it('showsAReadableErrorWhenTheServerRejectsTheRelease', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404 }),
    );
    renderDialog(fatima);

    await userEvent.click(
      screen.getByRole('button', { name: releaseConfirmationDialogCopy.confirm }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
