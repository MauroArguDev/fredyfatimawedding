import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';

const { fakeAuth, signOutMock, getIdTokenMock } = vi.hoisted(() => {
  return {
    fakeAuth: { currentUser: null as { getIdToken: () => Promise<string> } | null },
    signOutMock: vi.fn(),
    getIdTokenMock: vi.fn(),
  };
});

vi.mock('@/components/admin/auth/firebaseClient', () => ({ auth: fakeAuth }));
vi.mock('firebase/auth', () => ({
  signOut: (...args: unknown[]): unknown => signOutMock(...args),
}));

describe('fetchAdminApi', () => {
  beforeEach(() => {
    signOutMock.mockReset();
    getIdTokenMock.mockReset();
    fakeAuth.currentUser = null;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  it('attachesTheCurrentUsersIdTokenAsABearerHeader', async () => {
    getIdTokenMock.mockResolvedValue('a-fresh-token');
    fakeAuth.currentUser = { getIdToken: getIdTokenMock };

    await fetchAdminApi('/api/admin/guests');

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer a-fresh-token');
  });

  it('sendsNoAuthorizationHeaderWhenThereIsNoSignedInUser', async () => {
    await fetchAdminApi('/api/admin/guests');

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.has('Authorization')).toBe(false);
  });

  it('signsOutWhenTheApiRespondsWithA401SoTheNextRenderShowsTheLoginPage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    await fetchAdminApi('/api/admin/guests');

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('doesNotSignOutOnASuccessfulResponse', async () => {
    await fetchAdminApi('/api/admin/guests');

    expect(signOutMock).not.toHaveBeenCalled();
  });
});
