import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InvitationPage from '@/pages/invitation/InvitationPage';
import { invitationStatusCopy, notFoundCopy } from '@/content/appShell';

function renderAtToken(token: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/i/${token}`]}>
        <Routes>
          <Route path="/i/:token" element={<InvitationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('InvitationPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('showsALoadingStateBeforeTheResponseArrives', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => undefined));

    renderAtToken('a-valid-token');

    expect(screen.getByText(invitationStatusCopy.loading)).toBeInTheDocument();
  });

  it('rendersTheResolvedDisplayNameOnSuccess', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          titleLabel: 'Tío Orlando y Familia.',
          firstName: 'Orlando',
          guestLimit: 3,
          confirmed: false,
          confirmedCount: 0,
          rsvpOpen: true,
        }),
        { status: 200 },
      ),
    );

    renderAtToken('a-valid-token');

    await waitFor(() => {
      expect(screen.getByText('Tío Orlando y Familia.')).toBeInTheDocument();
    });
  });

  it('rendersTheNotFoundPageWithoutLeakingDetailsOnA404', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: 'TOKEN_NOT_FOUND' }), { status: 404 }),
    );

    renderAtToken('missing-token');

    await waitFor(() => {
      expect(screen.getByText(notFoundCopy.heading)).toBeInTheDocument();
    });
  });

  it('offersARetryButtonOnANetworkErrorThatKeepsTheSelection', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    renderAtToken('a-valid-token');

    await waitFor(() => {
      expect(screen.getByText(invitationStatusCopy.networkErrorHeading)).toBeInTheDocument();
    });

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          titleLabel: null,
          firstName: 'Orlando',
          guestLimit: 3,
          confirmed: false,
          confirmedCount: 0,
          rsvpOpen: true,
        }),
        { status: 200 },
      ),
    );

    await userEvent.click(screen.getByRole('button', { name: invitationStatusCopy.retry }));

    await waitFor(() => {
      expect(screen.getByText('Orlando')).toBeInTheDocument();
    });
  });
});
