import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuestInviteActions } from '@/components/admin/guests/GuestInviteActions';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { adminGuestInviteCopy } from '@/content/adminGuestInvite';
import type { AdminGuest } from '@/schemas/guest';

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: toastSuccessMock, error: toastErrorMock } }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

const orlando: AdminGuest = {
  id: 'id-1',
  token: 'V1StGXR8_Z5jdHi6B-myT',
  firstName: 'Orlando',
  lastName: null,
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

function renderActions() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <GuestInviteActions guest={orlando} />
    </QueryClientProvider>,
  );
}

function stubClipboard(writeText: ReturnType<typeof vi.fn>): ReturnType<typeof vi.fn> {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });

  return writeText;
}

describe('GuestInviteActions', () => {
  beforeEach(() => {
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    fetchAdminApiMock.mockResolvedValue(new Response(JSON.stringify(orlando), { status: 200 }));
    stubClipboard(vi.fn().mockResolvedValue(undefined));
  });

  it('opensWhatsAppWithTheInvitationLinkAndMarksTheGuestAsInvited', async () => {
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);
    renderActions();

    await userEvent.click(screen.getByRole('button', { name: adminGuestInviteCopy.sendButton }));

    expect(openMock).toHaveBeenCalledTimes(1);
    const [url] = openMock.mock.calls[0] as [string];
    expect(url).toContain('https://wa.me/50370000000');
    expect(fetchAdminApiMock).toHaveBeenCalledWith(
      '/api/admin/guests/id-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('copiesTheInvitationLinkAndShowsASuccessToast', async () => {
    const writeText = stubClipboard(vi.fn().mockResolvedValue(undefined));
    renderActions();

    await userEvent.click(screen.getByRole('button', { name: adminGuestInviteCopy.copyButton }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`/i/${orlando.token}`));
    expect(toastSuccessMock).toHaveBeenCalledWith(adminGuestInviteCopy.copySuccess);
  });

  it('showsAnErrorToastWhenCopyingFails', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    renderActions();

    await userEvent.click(screen.getByRole('button', { name: adminGuestInviteCopy.copyButton }));

    expect(toastErrorMock).toHaveBeenCalledWith(adminGuestInviteCopy.copyError);
  });
});
