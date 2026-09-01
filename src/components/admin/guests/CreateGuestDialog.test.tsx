import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateGuestDialog } from '@/components/admin/guests/CreateGuestDialog';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import {
  adminGuestFormErrorCopy,
  createGuestDialogCopy,
  guestFormFieldsCopy,
} from '@/content/adminGuestForm';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

function renderDialog() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateGuestDialog />
    </QueryClientProvider>,
  );
}

async function openDialog(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: createGuestDialogCopy.trigger }));
}

describe('CreateGuestDialog', () => {
  it('rejectsAnEmptySubmissionWithoutCallingTheApi', async () => {
    renderDialog();
    await openDialog();

    await userEvent.click(screen.getByRole('button', { name: createGuestDialogCopy.submit }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(fetchAdminApi).not.toHaveBeenCalled();
  });

  it('createsTheGuestWithValidDataAndClosesTheDialog', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'new-id',
          token: 'V1StGXR8_Z5jdHi6B-myT',
          firstName: 'Orlando',
          lastName: null,
          titleLabel: null,
          guestLimit: 3,
          phone: '+50370000000',
          notes: null,
          confirmed: false,
          confirmedCount: 0,
          confirmedAt: null,
          firstOpenedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        { status: 201 },
      ),
    );
    renderDialog();
    await openDialog();

    await userEvent.type(screen.getByLabelText(guestFormFieldsCopy.firstName), 'Orlando');
    await userEvent.type(screen.getByLabelText(guestFormFieldsCopy.phone), '+50370000000');
    await userEvent.clear(screen.getByLabelText(guestFormFieldsCopy.guestLimit));
    await userEvent.type(screen.getByLabelText(guestFormFieldsCopy.guestLimit), '3');
    await userEvent.click(screen.getByRole('button', { name: createGuestDialogCopy.submit }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('showsAReadableErrorWhenTheServerRejectsThePayload', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'INVALID_PAYLOAD' }), { status: 400 }),
    );
    renderDialog();
    await openDialog();

    await userEvent.type(screen.getByLabelText(guestFormFieldsCopy.firstName), 'Orlando');
    await userEvent.type(screen.getByLabelText(guestFormFieldsCopy.phone), '+50370000000');
    await userEvent.clear(screen.getByLabelText(guestFormFieldsCopy.guestLimit));
    await userEvent.type(screen.getByLabelText(guestFormFieldsCopy.guestLimit), '3');
    await userEvent.click(screen.getByRole('button', { name: createGuestDialogCopy.submit }));

    await waitFor(() => {
      expect(screen.getByText(adminGuestFormErrorCopy.INVALID_PAYLOAD)).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
