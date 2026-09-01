import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/components/admin/auth/LoginPage';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';
import { adminLoginCopy } from '@/content/adminAuth';

vi.mock('@/components/admin/auth/useAdminAuth');

const useAdminAuthMock = vi.mocked(useAdminAuth);

describe('LoginPage', () => {
  it('rejectsAnEmptySubmissionWithoutCallingSignIn', async () => {
    const signIn = vi.fn();
    useAdminAuthMock.mockReturnValue({
      user: null,
      initializing: false,
      signIn,
      signOutAdmin: vi.fn(),
    });

    render(<LoginPage />);

    await userEvent.click(screen.getByRole('button', { name: adminLoginCopy.submit }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('callsSignInWithTheEnteredCredentials', async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    useAdminAuthMock.mockReturnValue({
      user: null,
      initializing: false,
      signIn,
      signOutAdmin: vi.fn(),
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(adminLoginCopy.emailLabel), 'bride@example.com');
    await userEvent.type(screen.getByLabelText(adminLoginCopy.passwordLabel), 'correct-password');
    await userEvent.click(screen.getByRole('button', { name: adminLoginCopy.submit }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('bride@example.com', 'correct-password');
    });
  });

  it('showsTheSameGenericMessageNoMatterWhySignInFailed', async () => {
    const signIn = vi.fn().mockRejectedValue(new Error('auth/user-not-found'));
    useAdminAuthMock.mockReturnValue({
      user: null,
      initializing: false,
      signIn,
      signOutAdmin: vi.fn(),
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(adminLoginCopy.emailLabel), 'nobody@example.com');
    await userEvent.type(screen.getByLabelText(adminLoginCopy.passwordLabel), 'whatever');
    await userEvent.click(screen.getByRole('button', { name: adminLoginCopy.submit }));

    await waitFor(() => {
      expect(screen.getByText(adminLoginCopy.genericError)).toBeInTheDocument();
    });
    expect(screen.queryByText('auth/user-not-found')).not.toBeInTheDocument();
  });
});
