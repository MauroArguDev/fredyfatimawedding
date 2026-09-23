import { describe, expect, it } from 'vitest';
import { toInvitationContextValue } from '@/hooks/invitationContext';
import type { PublicInvitation } from '@/schemas/guest';

const baseInvitation: PublicInvitation = {
  titleLabel: null,
  firstName: 'Orlando',
  guestLimit: 3,
  confirmed: false,
  confirmedCount: 0,
  rsvpOpen: true,
};

describe('toInvitationContextValue', () => {
  it('usesTitleLabelAsDisplayNameWhenPresent', () => {
    const value = toInvitationContextValue({
      ...baseInvitation,
      titleLabel: 'Tío Orlando y Familia.',
    });

    expect(value.displayName).toBe('Tío Orlando y Familia.');
  });

  it('fallsBackToFirstNameWhenTitleLabelIsNull', () => {
    const value = toInvitationContextValue(baseInvitation);

    expect(value.displayName).toBe('Orlando');
  });

  it('carriesGuestLimitConfirmedAndRsvpOpenThrough', () => {
    const value = toInvitationContextValue({
      ...baseInvitation,
      guestLimit: 5,
      confirmed: true,
      confirmedCount: 2,
      rsvpOpen: false,
    });

    expect(value).toEqual({
      displayName: 'Orlando',
      guestLimit: 5,
      confirmed: true,
      confirmedCount: 2,
      rsvpOpen: false,
    });
  });
});
