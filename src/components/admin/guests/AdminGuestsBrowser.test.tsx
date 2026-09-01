import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminGuestsBrowser } from '@/components/admin/guests/AdminGuestsBrowser';
import { adminGuestsTableCopy } from '@/content/adminGuests';
import type { AdminGuest } from '@/schemas/guest';

const orlando: AdminGuest = {
  id: 'id-1',
  token: 'V1StGXR8_Z5jdHi6B-myT',
  firstName: 'Orlando',
  lastName: 'Martínez',
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

const fatima: AdminGuest = { ...orlando, id: 'id-2', firstName: 'Fátima', confirmed: true };

const stats = {
  total: 2,
  confirmed: 1,
  pending: 1,
  openedNotConfirmed: 0,
  totalConfirmedPeople: 0,
};

function firstBodyRowName(): string | undefined {
  const table = screen.getByRole('table');
  const firstRow = within(table).getAllByRole('row')[1];
  return firstRow === undefined ? undefined : within(firstRow).getAllByRole('cell')[1]?.textContent;
}

describe('AdminGuestsBrowser', () => {
  it('sortsByNameAscendingByDefault', () => {
    render(<AdminGuestsBrowser guests={[orlando, fatima]} stats={stats} />);

    expect(firstBodyRowName()).toBe('Fátima');
  });

  it('flipsTheDirectionWhenTheSameHeaderIsClickedAgain', async () => {
    render(<AdminGuestsBrowser guests={[orlando, fatima]} stats={stats} />);

    const nameHeader = screen.getByRole('button', {
      name: new RegExp(adminGuestsTableCopy.firstName),
    });
    await userEvent.click(nameHeader);

    expect(firstBodyRowName()).toBe('Orlando');
  });

  it('switchesToAscendingWhenAPreviouslyUnsortedHeaderIsClicked', async () => {
    render(<AdminGuestsBrowser guests={[orlando, fatima]} stats={stats} />);

    await userEvent.click(screen.getByRole('button', { name: adminGuestsTableCopy.status }));

    expect(firstBodyRowName()).toBe('Orlando');
  });
});
