import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import { InvitationProvider } from '@/hooks/InvitationProvider';
import { useInvitationContext } from '@/hooks/useInvitationContext';
import type { InvitationContextValue } from '@/hooks/invitationContext';

const value: InvitationContextValue = {
  displayName: 'Orlando',
  guestLimit: 3,
  confirmed: false,
  confirmedCount: 0,
  rsvpOpen: true,
};

const Consumer = (): ReactNode => {
  const invitation = useInvitationContext();
  return <p>{invitation.displayName}</p>;
};

describe('useInvitationContext', () => {
  it('returnsTheProvidedValueInsideAnInvitationProvider', () => {
    render(
      <InvitationProvider value={value}>
        <Consumer />
      </InvitationProvider>,
    );

    expect(screen.getByText('Orlando')).toBeInTheDocument();
  });

  it('throwsWhenUsedOutsideAnInvitationProvider', () => {
    expect(() => renderHook(() => useInvitationContext())).toThrow(
      'useInvitationContext must be used within an InvitationProvider',
    );
  });
});
