import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminGuestsBrowser } from '@/components/admin/guests/AdminGuestsBrowser';
import { adminGuestsTableCopy } from '@/content/adminGuests';
import type { AdminGuest } from '@/schemas/guest';

vi.mock('@/components/admin/auth/firebaseClient', () => ({ auth: {} }));

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

function renderBrowser(guests: AdminGuest[]) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminGuestsBrowser guests={guests} stats={stats} />
    </QueryClientProvider>,
  );
}

function firstBodyRowName(): string | undefined {
  const table = screen.getByRole('table');
  const firstRow = within(table).getAllByRole('row')[1];
  return firstRow === undefined ? undefined : within(firstRow).getAllByRole('cell')[1]?.textContent;
}

describe('AdminGuestsBrowser', () => {
  it('sortsByNameAscendingByDefault', () => {
    renderBrowser([orlando, fatima]);

    expect(firstBodyRowName()).toBe('Fátima');
  });

  it('flipsTheDirectionWhenTheSameHeaderIsClickedAgain', async () => {
    renderBrowser([orlando, fatima]);

    const nameHeader = screen.getByRole('button', {
      name: new RegExp(adminGuestsTableCopy.firstName),
    });
    await userEvent.click(nameHeader);

    expect(firstBodyRowName()).toBe('Orlando');
  });

  it('switchesToAscendingWhenAPreviouslyUnsortedHeaderIsClicked', async () => {
    renderBrowser([orlando, fatima]);

    await userEvent.click(screen.getByRole('button', { name: adminGuestsTableCopy.status }));

    expect(firstBodyRowName()).toBe('Orlando');
  });
});
