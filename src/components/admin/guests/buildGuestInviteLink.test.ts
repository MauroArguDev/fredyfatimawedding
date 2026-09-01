import { describe, expect, it } from 'vitest';
import {
  buildGuestWhatsAppLink,
  buildInvitationUrl,
} from '@/components/admin/guests/buildGuestInviteLink';

describe('buildInvitationUrl', () => {
  it('joinsTheOriginAndTokenUnderTheInvitationRoute', () => {
    expect(buildInvitationUrl('https://fredyfatimawedding.vercel.app', 'abc123')).toBe(
      'https://fredyfatimawedding.vercel.app/i/abc123',
    );
  });
});

describe('buildGuestWhatsAppLink', () => {
  it('stripsTheLeadingPlusBecauseWaMeExpectsDigitsOnly', () => {
    const link = buildGuestWhatsAppLink('+50370000000', 'hola');

    expect(link.startsWith('https://wa.me/50370000000?text=')).toBe(true);
  });

  it('urlEncodesTheMessage', () => {
    const link = buildGuestWhatsAppLink('+50370000000', 'hola mundo');

    expect(link).toContain('text=hola%20mundo');
  });
});
