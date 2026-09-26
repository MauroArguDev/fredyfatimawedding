import { describe, expect, it } from 'vitest';
import { buildInvitationUrl } from '@/components/admin/guests/buildGuestInviteLink';

describe('buildInvitationUrl', () => {
  it('joinsTheOriginAndTokenUnderTheInvitationRoute', () => {
    expect(buildInvitationUrl('https://fredyfatimawedding.vercel.app', 'abc123')).toBe(
      'https://fredyfatimawedding.vercel.app/i/abc123',
    );
  });
});
