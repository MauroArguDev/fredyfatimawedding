import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSubmitRsvp, RsvpApiError } from '@/hooks/useSubmitRsvp';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
}

describe('useSubmitRsvp', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolvesSuccessfullyOnAnOkResponse', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const { result } = renderHook(() => useSubmitRsvp(), { wrapper: createWrapper() });

    result.current.mutate({ token: 'V1StGXR8_Z5jdHi6B-myT', count: 3 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.ok).toBe(true);
  });

  it('sendsThePostRequestWithTheTokenAndCountAsJson', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const { result } = renderHook(() => useSubmitRsvp(), { wrapper: createWrapper() });

    result.current.mutate({ token: 'V1StGXR8_Z5jdHi6B-myT', count: 2 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(fetch).toHaveBeenCalledWith(
      '/api/rsvp',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'V1StGXR8_Z5jdHi6B-myT', count: 2 }),
      }),
    );
  });

  it('rejectsWithARsvpApiErrorCarryingTheServerCodeOnAFailedResponse', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: 'ALREADY_CONFIRMED' }), { status: 409 }),
    );
    const { result } = renderHook(() => useSubmitRsvp(), { wrapper: createWrapper() });

    result.current.mutate({ token: 'V1StGXR8_Z5jdHi6B-myT', count: 1 });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(RsvpApiError);
    expect((result.current.error as RsvpApiError).code).toBe('ALREADY_CONFIRMED');
  });
});
