import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditGuestDialog } from '@/components/admin/guests/EditGuestDialog';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import {
  editGuestDialogCopy,
  guestFormFieldsCopy,
  adminGuestFormErrorCopy,
  adminGuestToastCopy,
} from '@/content/adminGuestForm';
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
      <EditGuestDialog guest={guest} onClose={onClose} />
    </QueryClientProvider>,
  );
}

describe('EditGuestDialog', () => {
  it('doesNotRenderADialogWhenThereIsNoGuest', () => {
    renderDialog(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('prefillsTheFormWithTheGuestsCurrentData', async () => {
    renderDialog(orlando);

    await waitFor(() => {
      expect(screen.getByLabelText(guestFormFieldsCopy.firstName)).toHaveValue('Orlando');
    });
    expect(screen.getByLabelText(guestFormFieldsCopy.confirmedCount)).toHaveValue(2);
  });

  it('rejectsAGuestLimitBelowTheConfirmedCount', async () => {
    renderDialog(orlando);
    await waitFor(() => screen.getByLabelText(guestFormFieldsCopy.firstName));

    const guestLimitInput = screen.getByLabelText(guestFormFieldsCopy.guestLimit);
    await userEvent.clear(guestLimitInput);
    await userEvent.type(guestLimitInput, '1');
    await userEvent.click(screen.getByRole('button', { name: editGuestDialogCopy.submit }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(fetchAdminApi).not.toHaveBeenCalled();
  });

  it('submitsThePatchAndClosesOnSuccess', async () => {
    const onClose = vi.fn();
    fetchAdminApiMock.mockResolvedValue(new Response(JSON.stringify(orlando), { status: 200 }));
    renderDialog(orlando, onClose);
    await waitFor(() => screen.getByLabelText(guestFormFieldsCopy.firstName));

    await userEvent.click(screen.getByRole('button', { name: editGuestDialogCopy.submit }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(fetchAdminApi).toHaveBeenCalledWith(
      '/api/admin/guests/id-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith(adminGuestToastCopy.updated);
  });

  it('showsAReadableErrorWhenTheServerRejectsTheUpdate', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'GUEST_LIMIT_BELOW_CONFIRMED_COUNT' }), { status: 400 }),
    );
    renderDialog(orlando);
    await waitFor(() => screen.getByLabelText(guestFormFieldsCopy.firstName));

    await userEvent.click(screen.getByRole('button', { name: editGuestDialogCopy.submit }));

    await waitFor(() => {
      expect(
        screen.getByText(adminGuestFormErrorCopy.GUEST_LIMIT_BELOW_CONFIRMED_COUNT),
      ).toBeInTheDocument();
    });
  });
});
