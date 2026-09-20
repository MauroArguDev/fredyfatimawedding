import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RsvpForm } from '@/components/ui/RsvpForm';
import { rsvpConfirmModalCopy, rsvpErrorMessages } from '@/content/rsvp';

const TOKEN = 'V1StGXR8_Z5jdHi6B-myT';

function renderRsvpForm(
  overrides: {
    onAlreadyConfirmed?: () => void;
    onClosed?: () => void;
    onSuccess?: (result: { count: number; waLink: string }) => void;
  } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const onAlreadyConfirmed = overrides.onAlreadyConfirmed ?? vi.fn();
  const onClosed = overrides.onClosed ?? vi.fn();
  const onSuccess = overrides.onSuccess ?? vi.fn();

  render(
    <QueryClientProvider client={queryClient}>
      <RsvpForm
        token={TOKEN}
        guestLimit={3}
        onAlreadyConfirmed={onAlreadyConfirmed}
        onClosed={onClosed}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>,
  );

  return { onAlreadyConfirmed, onClosed, onSuccess };
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('RsvpForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('showsAFieldErrorWhenSubmittingWithoutSelectingACount', async () => {
    const user = userEvent.setup();
    renderRsvpForm();

    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('opensTheConfirmationModalWithTheSelectedCountBeforeSubmitting', async () => {
    const user = userEvent.setup();
    renderRsvpForm();

    await user.selectOptions(screen.getByRole('combobox'), '2');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(rsvpConfirmModalCopy.body(2))).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('callsOnSuccessWithTheWaLinkWhenTheGuestConfirmsInTheModal', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ ok: true, waLink: 'https://wa.me/50376982534?text=hi' }, 200),
    );
    const user = userEvent.setup();
    const { onSuccess } = renderRsvpForm();

    await user.selectOptions(screen.getByRole('combobox'), '2');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        count: 2,
        waLink: 'https://wa.me/50376982534?text=hi',
      });
    });
  });

  it('closesTheModalWithoutSubmittingWhenTheGuestClicksVolver', async () => {
    const user = userEvent.setup();
    renderRsvpForm();

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.cancelLabel }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('callsOnAlreadyConfirmedWithoutShowingAGenericErrorWhenTheServerRejectsWithAlreadyConfirmed', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ code: 'ALREADY_CONFIRMED' }, 409));
    const user = userEvent.setup();
    const { onAlreadyConfirmed } = renderRsvpForm();

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    await waitFor(() => {
      expect(onAlreadyConfirmed).toHaveBeenCalled();
    });
  });

  it('callsOnClosedWhenTheServerRejectsWithRsvpClosed', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ code: 'RSVP_CLOSED' }, 409));
    const user = userEvent.setup();
    const { onClosed } = renderRsvpForm();

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    await waitFor(() => {
      expect(onClosed).toHaveBeenCalled();
    });
  });

  it('showsATransientToastAndKeepsTheSelectionWhenTheServerRejectsWithARateLimit', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ code: 'RATE_LIMITED' }, 429));
    const user = userEvent.setup();
    renderRsvpForm();

    await user.selectOptions(screen.getByRole('combobox'), '2');
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(screen.getByRole('button', { name: rsvpConfirmModalCopy.confirmLabel }));

    expect(await screen.findByText(rsvpErrorMessages.RATE_LIMITED)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('2');
  });
});
