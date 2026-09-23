import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAuthProvider } from '@/components/admin/auth/AdminAuthProvider';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';

const authStateCallbacks: ((user: { uid: string } | null) => void)[] = [];
const signInWithEmailAndPasswordMock = vi.fn();
const signOutMock = vi.fn();

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
  signInWithEmailAndPassword: (...args: unknown[]): unknown =>
    signInWithEmailAndPasswordMock(...args),
  signOut: (...args: unknown[]): unknown => signOutMock(...args),
}));

const Consumer = (): ReactNode => {
  const { user, initializing, signIn, signOutAdmin } = useAdminAuth();

  return (
    <div>
      <p>initializing:{String(initializing)}</p>
      <p>user:{user === null ? 'null' : user.uid}</p>
      <button
        type="button"
        onClick={() => {
          void signIn('bride@example.com', 'correct-password');
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={() => {
          void signOutAdmin();
        }}
      >
        logout
      </button>
    </div>
  );
};

describe('AdminAuthProvider', () => {
  beforeEach(() => {
    authStateCallbacks.length = 0;
    signInWithEmailAndPasswordMock.mockReset();
    signOutMock.mockReset();
  });

  it('startsInitializingAndResolvesOnceTheAuthStateListenerFires', async () => {
    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    expect(screen.getByText('initializing:true')).toBeInTheDocument();

    authStateCallbacks[0]?.(null);

    await waitFor(() => {
      expect(screen.getByText('initializing:false')).toBeInTheDocument();
    });
    expect(screen.getByText('user:null')).toBeInTheDocument();
  });

  it('exposesTheSignedInUserOnceTheListenerReportsOne', async () => {
    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    authStateCallbacks[0]?.({ uid: 'admin-1' });

    await waitFor(() => {
      expect(screen.getByText('user:admin-1')).toBeInTheDocument();
    });
  });

  it('callsFirebaseSignOutWhenSignOutAdminIsInvoked', async () => {
    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    authStateCallbacks[0]?.({ uid: 'admin-1' });
    await waitFor(() => screen.getByText('user:admin-1'));

    await userEvent.click(screen.getByRole('button', { name: 'logout' }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('callsFirebaseSignInWithEmailAndPasswordWhenSignInIsInvoked', async () => {
    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'login' }));

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(
      expect.anything(),
      'bride@example.com',
      'correct-password',
    );
  });
});
