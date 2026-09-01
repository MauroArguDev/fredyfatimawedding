import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { RequireAdminAuth } from '@/components/admin/auth/RequireAdminAuth';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';
import { adminAuthLoadingCopy, adminLoginCopy } from '@/content/adminAuth';

const fakeUser = { uid: 'admin-1' } as unknown as User;

vi.mock('@/components/admin/auth/useAdminAuth');

const useAdminAuthMock = vi.mocked(useAdminAuth);

describe('RequireAdminAuth', () => {
  it('showsALoadingStateWhileTheAuthListenerIsInitializing', () => {
    useAdminAuthMock.mockReturnValue({
      user: null,
      initializing: true,
      signIn: vi.fn(),
      signOutAdmin: vi.fn(),
    });

    render(
      <RequireAdminAuth>
        <p>Protected</p>
      </RequireAdminAuth>,
    );

    expect(screen.getByText(adminAuthLoadingCopy.checkingSession)).toBeInTheDocument();
  });

  it('showsTheLoginPageWhenThereIsNoUser', () => {
    useAdminAuthMock.mockReturnValue({
      user: null,
      initializing: false,
      signIn: vi.fn(),
      signOutAdmin: vi.fn(),
    });

    render(
      <RequireAdminAuth>
        <p>Protected</p>
      </RequireAdminAuth>,
    );

    expect(screen.getByRole('heading', { name: adminLoginCopy.title })).toBeInTheDocument();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('rendersTheChildrenWhenAUserIsSignedIn', () => {
    useAdminAuthMock.mockReturnValue({
      user: fakeUser,
      initializing: false,
      signIn: vi.fn(),
      signOutAdmin: vi.fn(),
    });

    render(
      <RequireAdminAuth>
        <p>Protected</p>
      </RequireAdminAuth>,
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
