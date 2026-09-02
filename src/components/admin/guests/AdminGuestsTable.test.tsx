import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminGuestsTable } from '@/components/admin/guests/AdminGuestsTable';
import { adminGuestsTableCopy } from '@/content/adminGuests';
import { editGuestDialogCopy } from '@/content/adminGuestForm';
import {
  deleteGuestDialogCopy,
  releaseConfirmationDialogCopy,
  rotateTokenDialogCopy,
} from '@/content/adminGuestActions';
import { adminGuestInviteCopy } from '@/content/adminGuestInvite';
import type { AdminGuest } from '@/schemas/guest';

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));

const orlando: AdminGuest = {
  id: 'id-1',
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
  invitedAt: null,
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
};

const fatima: AdminGuest = {
  ...orlando,
  id: 'id-2',
  firstName: 'Fátima',
  titleLabel: 'Tía Fátima',
  confirmed: true,
  confirmedCount: 2,
  firstOpenedAt: new Date('2026-08-15T18:30:00-06:00'),
  invitedAt: new Date('2026-08-16T10:00:00-06:00'),
};

function renderTable(
  guests: AdminGuest[],
  overrides: Partial<Parameters<typeof AdminGuestsTable>[0]> = {},
) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminGuestsTable
        guests={guests}
        sort={{ key: 'name', direction: 'asc' }}
        onToggleSort={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReleaseConfirmation={vi.fn()}
        onRotateToken={vi.fn()}
        {...overrides}
      />
    </QueryClientProvider>,
  );
}

describe('AdminGuestsTable', () => {
  it('rendersOneRowPerGuestWithTheirData', () => {
    renderTable([orlando, fatima]);

    expect(screen.getByText('Orlando')).toBeInTheDocument();
    expect(screen.getByText('Tía Fátima')).toBeInTheDocument();
    expect(screen.getByText(adminGuestsTableCopy.statusConfirmed)).toBeInTheDocument();
    expect(screen.getByText(adminGuestsTableCopy.statusPending)).toBeInTheDocument();
  });

  it('showsAPlaceholderForAGuestWhoNeverOpenedTheInvitation', () => {
    renderTable([orlando]);

    const row = screen.getByText('Orlando').closest('tr');
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent(adminGuestsTableCopy.never);
  });

  it('callsOnToggleSortWithNameWhenTheNameHeaderIsClicked', async () => {
    const onToggleSort = vi.fn();
    renderTable([orlando], { onToggleSort });

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(adminGuestsTableCopy.firstName) }),
    );

    expect(onToggleSort).toHaveBeenCalledWith('name');
  });

  it('callsOnToggleSortWithStatusWhenTheStatusHeaderIsClicked', async () => {
    const onToggleSort = vi.fn();
    renderTable([orlando], { onToggleSort });

    await userEvent.click(screen.getByRole('button', { name: adminGuestsTableCopy.status }));

    expect(onToggleSort).toHaveBeenCalledWith('status');
  });

  it('showsEditAndDeleteButtonsButNotReleaseForAPendingGuest', () => {
    renderTable([orlando]);

    expect(screen.getByRole('button', { name: editGuestDialogCopy.trigger })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: deleteGuestDialogCopy.trigger })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: releaseConfirmationDialogCopy.trigger }),
    ).not.toBeInTheDocument();
  });

  it('alsoShowsTheReleaseConfirmationButtonForAConfirmedGuest', () => {
    renderTable([fatima]);

    expect(
      screen.getByRole('button', { name: releaseConfirmationDialogCopy.trigger }),
    ).toBeInTheDocument();
  });

  it('callsOnEditWithTheGuestWhenEditIsClicked', async () => {
    const onEdit = vi.fn();
    renderTable([orlando], { onEdit });

    await userEvent.click(screen.getByRole('button', { name: editGuestDialogCopy.trigger }));

    expect(onEdit).toHaveBeenCalledWith(orlando);
  });

  it('callsOnDeleteWithTheGuestWhenDeleteIsClicked', async () => {
    const onDelete = vi.fn();
    renderTable([orlando], { onDelete });

    await userEvent.click(screen.getByRole('button', { name: deleteGuestDialogCopy.trigger }));

    expect(onDelete).toHaveBeenCalledWith(orlando);
  });

  it('showsWhetherEachGuestWasAlreadyInvited', () => {
    renderTable([orlando, fatima]);

    expect(screen.getByText(adminGuestInviteCopy.invitedNo)).toBeInTheDocument();
    expect(screen.getByText(adminGuestInviteCopy.invitedYes)).toBeInTheDocument();
  });

  it('showsSendAndCopyInviteButtonsForEveryGuest', () => {
    renderTable([orlando]);

    expect(
      screen.getByRole('button', { name: adminGuestInviteCopy.sendButton }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: adminGuestInviteCopy.copyButton }),
    ).toBeInTheDocument();
  });

  it('callsOnReleaseConfirmationWithTheGuestWhenReleaseIsClicked', async () => {
    const onReleaseConfirmation = vi.fn();
    renderTable([fatima], { onReleaseConfirmation });

    await userEvent.click(
      screen.getByRole('button', { name: releaseConfirmationDialogCopy.trigger }),
    );

    expect(onReleaseConfirmation).toHaveBeenCalledWith(fatima);
  });

  it('showsARotateTokenButtonForEveryGuestRegardlessOfStatus', () => {
    renderTable([orlando, fatima]);

    expect(screen.getAllByRole('button', { name: rotateTokenDialogCopy.trigger })).toHaveLength(2);
  });

  it('callsOnRotateTokenWithTheGuestWhenRotateTokenIsClicked', async () => {
    const onRotateToken = vi.fn();
    renderTable([orlando], { onRotateToken });

    await userEvent.click(screen.getByRole('button', { name: rotateTokenDialogCopy.trigger }));

    expect(onRotateToken).toHaveBeenCalledWith(orlando);
  });
});
