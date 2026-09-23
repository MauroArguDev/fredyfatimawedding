import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminApp from '@/pages/admin/AdminApp';
import { adminShellCopy } from '@/content/appShell';
import { adminLoginCopy } from '@/content/adminAuth';
import { adminGuestsPageCopy } from '@/content/adminGuests';
import { useAdminGuests } from '@/components/admin/guests/useAdminGuests';

const authStateCallbacks: ((user: { uid: string } | null) => void)[] = [];
const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }));

vi.mock('@/components/admin/auth/firebaseClient', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: { uid: string } | null) => void) => {
    authStateCallbacks.push(callback);
    return () => {
      const index = authStateCallbacks.indexOf(callback);
      if (index >= 0) {
        authStateCallbacks.splice(index, 1);
      }
    };
  },
  signInWithEmailAndPassword: vi.fn(),
  signOut: (...args: unknown[]): unknown => signOutMock(...args),
}));
vi.mock('@/components/admin/guests/useAdminGuests');

const useAdminGuestsMock = vi.mocked(useAdminGuests);

describe('AdminApp', () => {
  beforeEach(() => {
    authStateCallbacks.length = 0;
    signOutMock.mockReset();
    useAdminGuestsMock.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
    } as never);
  });

  it('showsTheLoginPageWhenThereIsNoSignedInUser', async () => {
    render(<AdminApp />);

    authStateCallbacks[0]?.(null);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: adminLoginCopy.title })).toBeInTheDocument();
    });
  });

  it('showsTheShellWithTheGuestsPageOnceAUserIsSignedIn', async () => {
    render(<AdminApp />);

    authStateCallbacks[0]?.({ uid: 'admin-1' });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: adminShellCopy.title })).toBeInTheDocument();
    });
    expect(screen.getByText(adminGuestsPageCopy.loading)).toBeInTheDocument();
  });

  it('callsFirebaseSignOutWhenTheShellsLogoutButtonIsClicked', async () => {
    render(<AdminApp />);

    authStateCallbacks[0]?.({ uid: 'admin-1' });
    await waitFor(() => screen.getByRole('heading', { name: adminShellCopy.title }));

    await userEvent.click(screen.getByRole('button', { name: adminShellCopy.logout }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
