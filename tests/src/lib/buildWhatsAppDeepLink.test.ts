import { describe, expect, it } from 'vitest';
import { buildWhatsAppDeepLink } from '@/lib/buildWhatsAppDeepLink';

describe('buildWhatsAppDeepLink', () => {
  it('stripsTheLeadingPlusBecauseWhatsappExpectsDigitsOnly', () => {
    const link = buildWhatsAppDeepLink('+50370000000', 'hola');

    expect(link.startsWith('https://api.whatsapp.com/send/?phone=50370000000&text=')).toBe(true);
  });

  it('stripsSpacesAndDashesSoHandTypedNumbersStillWork', () => {
    const link = buildWhatsAppDeepLink('+503 7000-0000', 'hola');

    expect(link).toContain('phone=50370000000&');
  });

  it('usesApiWhatsappComInsteadOfWaMeBecauseWaMesRedirectCorruptsEmojiInTheTextParam', () => {
    const link = buildWhatsAppDeepLink('+50370000000', 'hola');

    expect(link).not.toContain('wa.me');
  });

  it('urlEncodesTheMessageAsStandardUtf8', () => {
    const link = buildWhatsAppDeepLink('+50370000000', 'hola mundo 🥳');

    expect(link).toContain('text=hola%20mundo%20%F0%9F%A5%B3');
  });
});
