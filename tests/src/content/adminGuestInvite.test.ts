import { describe, expect, it } from 'vitest';
import { buildGuestInviteMessage } from '@/content/adminGuestInvite';

describe('buildGuestInviteMessage', () => {
  it('greetsTheGuestByFirstAndLastNameWhenBothAreKnown', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      'Martínez',
      'https://fredyfatimawedding.vercel.app/i/abc123',
      3,
    );

    expect(message.startsWith('Orlando y Martínez!')).toBe(true);
  });

  it('greetsTheGuestByFirstNameOnlyWhenThereIsNoLastName', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      null,
      'https://fredyfatimawedding.vercel.app/i/abc123',
      3,
    );

    expect(message.startsWith('Orlando!')).toBe(true);
  });

  it('includesTheInvitationLink', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      null,
      'https://fredyfatimawedding.vercel.app/i/abc123',
      3,
    );

    expect(message).toContain('https://fredyfatimawedding.vercel.app/i/abc123');
  });

  it('usesThePluralSpotsWordingWhenTheGuestLimitIsGreaterThanOne', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      null,
      'https://fredyfatimawedding.vercel.app/i/abc123',
      3,
    );

    expect(message).toContain('¡Tenemos 3 lugares reservados especialmente para ti!');
  });

  it('usesTheSingularSpotWordingWhenTheGuestLimitIsExactlyOne', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      null,
      'https://fredyfatimawedding.vercel.app/i/abc123',
      1,
    );

    expect(message).toContain('¡Tenemos 1 lugar reservado especialmente para ti!');
  });

  it('usesOnlyStandaloneEmojiBecauseWhatsAppBreaksSkinTonesVariationSelectorsAndJoiners', () => {
    const message = buildGuestInviteMessage(
      'Orlando',
      null,
      'https://fredyfatimawedding.vercel.app/i/abc123',
      3,
    );

    expect(message).not.toMatch(/️|‍|[\u{1F3FB}-\u{1F3FF}]/u);
  });
});
