import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useInvitation, InvitationNotFoundError } from '@/hooks/useInvitation';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

describe('useInvitation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolvesWithThePublicInvitationShapeOnSuccess', async () => {
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

    const { result } = renderHook(() => useInvitation('a-valid-token'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.firstName).toBe('Orlando');
    expect(fetch).toHaveBeenCalledWith('/api/invitation/a-valid-token');
  });

  it('rejectsWithInvitationNotFoundErrorOnA404AndDoesNotRetry', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: 'TOKEN_NOT_FOUND' }), { status: 404 }),
    );

    const { result } = renderHook(() => useInvitation('missing-token'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(InvitationNotFoundError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('rejectsWithAGenericErrorOnAnUnexpectedStatus', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useInvitation('a-valid-token'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).not.toBeInstanceOf(InvitationNotFoundError);
  });

  it('staysDisabledWhenTheTokenIsEmpty', () => {
    const { result } = renderHook(() => useInvitation(''), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetch).not.toHaveBeenCalled();
  });
});
