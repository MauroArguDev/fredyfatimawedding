import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RotateTokenDialog } from '@/components/admin/guests/RotateTokenDialog';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { rotateTokenDialogCopy } from '@/content/adminGuestActions';
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
  lastName: null,
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
      <RotateTokenDialog guest={guest} onClose={onClose} />
    </QueryClientProvider>,
  );
}

describe('RotateTokenDialog', () => {
  it('doesNotRenderWhenThereIsNoGuest', () => {
    renderDialog(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('warnsThatThePreviousLinkStopsWorking', () => {
    renderDialog(orlando);

    expect(screen.getByText(/deja de funcionar de inmediato/)).toBeInTheDocument();
  });

  it('postsToTheRotateTokenEndpointAndClosesOnConfirm', async () => {
    const onClose = vi.fn();
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ ...orlando, token: 'newtoken0000000000000' }), {
        status: 200,
      }),
    );
    renderDialog(orlando, onClose);

    await userEvent.click(screen.getByRole('button', { name: rotateTokenDialogCopy.confirm }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith(
      '/api/admin/guests/id-1/rotate-token',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith(adminGuestToastCopy.tokenRotated);
  });

  it('showsAReadableErrorWhenTheServerRejectsTheRotation', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404 }),
    );
    renderDialog(orlando);

    await userEvent.click(screen.getByRole('button', { name: rotateTokenDialogCopy.confirm }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
