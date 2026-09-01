import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminGuestsPage } from '@/components/admin/guests/AdminGuestsPage';
import { useAdminGuests } from '@/components/admin/guests/useAdminGuests';
import { adminGuestsPageCopy } from '@/content/adminGuests';
import type { AdminGuest } from '@/schemas/guest';

vi.mock('@/components/admin/guests/useAdminGuests', () => ({ useAdminGuests: vi.fn() }));

const useAdminGuestsMock = vi.mocked(useAdminGuests);

function renderPage() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminGuestsPage />
    </QueryClientProvider>,
  );
}

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

const stats = {
  total: 1,
  confirmed: 0,
  pending: 1,
  openedNotConfirmed: 0,
  totalConfirmedPeople: 0,
};

describe('AdminGuestsPage', () => {
  it('showsALoadingStateWhileThePendingQueryIsInFlight', () => {
    useAdminGuestsMock.mockReturnValue({ isPending: true, isError: false } as never);

    renderPage();

    expect(screen.getByText(adminGuestsPageCopy.loading)).toBeInTheDocument();
  });

  it('showsARetryableErrorStateWhenTheQueryFails', async () => {
    const refetch = vi.fn();
    useAdminGuestsMock.mockReturnValue({ isPending: false, isError: true, refetch } as never);

    renderPage();
    await userEvent.click(screen.getByRole('button', { name: adminGuestsPageCopy.retry }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('showsTheEmptyListCopyWhenThereAreNoGuestsAtAll', () => {
    useAdminGuestsMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: { guests: [], stats: { ...stats, total: 0 } },
    } as never);

    renderPage();

    expect(screen.getByText(adminGuestsPageCopy.emptyList)).toBeInTheDocument();
  });

  it('showsTheFilteredEmptyCopyWhenAGuestListExistsButTheSearchMatchesNothing', async () => {
    useAdminGuestsMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: { guests: [orlando], stats },
    } as never);

    renderPage();

    await userEvent.type(screen.getByLabelText('Buscar invitados'), 'nadie-coincide');

    expect(screen.getByText(adminGuestsPageCopy.emptyFiltered)).toBeInTheDocument();
  });

  it('rendersTheTableAndStatsWhenThereAreGuests', () => {
    useAdminGuestsMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: { guests: [orlando], stats },
    } as never);

    renderPage();

    expect(screen.getByText('Orlando')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
