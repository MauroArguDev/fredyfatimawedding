import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RsvpFormCard } from '@/components/ui/RsvpFormCard';
import { rsvpConfirmModalCopy, rsvpSuccessCopy, formatGuestCountSummary } from '@/content/rsvp';

const TOKEN = 'V1StGXR8_Z5jdHi6B-myT';

function renderCard(overrides: Partial<Parameters<typeof RsvpFormCard>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <RsvpFormCard
        token={TOKEN}
        guestLimit={3}
        confirmed={false}
        confirmedCount={0}
        rsvpOpen={true}
        {...overrides}
      />
    </QueryClientProvider>,
  );
}

describe('RsvpFormCard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rendersThePickerFormWhenNotConfirmedAndRsvpIsOpen', () => {
    renderCard();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('rendersTheConfirmedSummaryInsteadOfTheFormWhenAlreadyConfirmed', () => {
    renderCard({ confirmed: true, confirmedCount: 4 });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText(formatGuestCountSummary(4))).toBeInTheDocument();
  });

  it('rendersTheClosedMessageInsteadOfTheFormWhenRsvpOpenIsFalse', () => {
    renderCard({ rsvpOpen: false });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('switchesToTheSuccessScreenAfterAConfirmedSubmission', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, waLink: 'https://wa.me/50376982534?text=hi' }), {
        status: 200,
      }),
    );
    const user = userEvent.setup();
    renderCard();

    await user.selectOptions(screen.getByRole('combobox'), '2');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    expect(await screen.findByText(rsvpSuccessCopy.heading)).toBeInTheDocument();
    expect(screen.getByText(formatGuestCountSummary(2))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: rsvpSuccessCopy.whatsappButtonLabel })).toHaveAttribute(
      'href',
      'https://wa.me/50376982534?text=hi',
    );
  });

  it('switchesToTheClosedStateWhenTheServerRejectsAStaleSubmissionAfterTheDeadline', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: 'RSVP_CLOSED' }), { status: 409 }),
    );
    const user = userEvent.setup();
    renderCard();

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    await waitFor(() => {
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  it('switchesToTheAlreadyConfirmedStateWithoutAConfirmedCountWhenTheServerRejectsAStaleSubmission', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: 'ALREADY_CONFIRMED' }), {
        status: 409,
      }),
    );
    const user = userEvent.setup();
    renderCard();

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    await waitFor(() => {
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
    expect(screen.queryByText(/^Confirmaste/)).not.toBeInTheDocument();
  });
});
