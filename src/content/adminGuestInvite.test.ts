import { describe, expect, it } from 'vitest';
import { buildGuestInviteMessage } from './adminGuestInvite';

describe('buildGuestInviteMessage', () => {
  it('includesTheGuestsFirstNameAndTheInvitationLink', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      'https://fredyfatimawedding.vercel.app/i/abc123',
    );

    expect(message).toContain('Orlando');
    expect(message).toContain('https://fredyfatimawedding.vercel.app/i/abc123');
  });
});
