import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminGuestsTable } from '@/components/admin/guests/AdminGuestsTable';
import { adminGuestsTableCopy } from '@/content/adminGuests';
import type { AdminGuest } from '@/schemas/guest';

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
};

describe('AdminGuestsTable', () => {
  it('rendersOneRowPerGuestWithTheirData', () => {
    render(
      <AdminGuestsTable
        guests={[orlando, fatima]}
        sort={{ key: 'name', direction: 'asc' }}
        onToggleSort={vi.fn()}
      />,
    );

    expect(screen.getByText('Orlando')).toBeInTheDocument();
    expect(screen.getByText('Tía Fátima')).toBeInTheDocument();
    expect(screen.getByText(adminGuestsTableCopy.statusConfirmed)).toBeInTheDocument();
    expect(screen.getByText(adminGuestsTableCopy.statusPending)).toBeInTheDocument();
  });

  it('showsAPlaceholderForAGuestWhoNeverOpenedTheInvitation', () => {
    render(
      <AdminGuestsTable
        guests={[orlando]}
        sort={{ key: 'name', direction: 'asc' }}
        onToggleSort={vi.fn()}
      />,
    );

    const row = screen.getByText('Orlando').closest('tr');
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent(adminGuestsTableCopy.never);
  });

  it('callsOnToggleSortWithNameWhenTheNameHeaderIsClicked', async () => {
    const onToggleSort = vi.fn();

    render(
      <AdminGuestsTable
        guests={[orlando]}
        sort={{ key: 'name', direction: 'asc' }}
        onToggleSort={onToggleSort}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(adminGuestsTableCopy.firstName) }),
    );

    expect(onToggleSort).toHaveBeenCalledWith('name');
  });

  it('callsOnToggleSortWithStatusWhenTheStatusHeaderIsClicked', async () => {
    const onToggleSort = vi.fn();

    render(
      <AdminGuestsTable
        guests={[orlando]}
        sort={{ key: 'name', direction: 'asc' }}
        onToggleSort={onToggleSort}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: adminGuestsTableCopy.status }));

    expect(onToggleSort).toHaveBeenCalledWith('status');
  });
});
