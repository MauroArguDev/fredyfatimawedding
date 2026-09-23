import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminGuestsPage } from '@/components/admin/guests/AdminGuestsPage';
import { useAdminGuests } from '@/components/admin/guests/useAdminGuests';
import { AdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { adminGuestsPageCopy } from '@/content/adminGuests';
import { resolveAdminGuestErrorMessage } from '@/content/adminGuestForm';
import type { AdminGuest } from '@/schemas/guest';

vi.mock('@/components/admin/guests/useAdminGuests', () => ({ useAdminGuests: vi.fn() }));
vi.mock('@/components/admin/auth/firebaseClient', () => ({ auth: {} }));

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
  confirmed: false,
  confirmedCount: 0,
  confirmedAt: null,
  firstOpenedAt: null,
  invitedAt: null,
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

  it('showsARetryableErrorStateWithTheServerCodeSpecificMessageWhenTheQueryFails', async () => {
    const refetch = vi.fn();
    useAdminGuestsMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: new AdminGuestsApiError('NOT_FOUND'),
      refetch,
    } as never);

    renderPage();

    expect(screen.getByText(resolveAdminGuestErrorMessage('NOT_FOUND'))).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: adminGuestsPageCopy.retry }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('fallsBackToTheGenericErrorMessageWhenTheErrorIsNotAnAdminGuestsApiError', () => {
    useAdminGuestsMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: new TypeError('Failed to fetch'),
      refetch: vi.fn(),
    } as never);

    renderPage();

    expect(screen.getByText(resolveAdminGuestErrorMessage('NETWORK'))).toBeInTheDocument();
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
