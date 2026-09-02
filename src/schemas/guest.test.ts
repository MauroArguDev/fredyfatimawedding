import { describe, expect, it } from 'vitest';
import {
  MAX_GUEST_LIMIT,
  adminGuestListResponseSchema,
  adminGuestSchema,
  computeGuestStats,
  createGuestSchema,
  fitsWithinGuestLimit,
  guestLimitCoversConfirmedCount,
  resolveDisplayName,
  rsvpRequestSchema,
  updateGuestSchema,
} from './guest';

const validGuest = {
  firstName: 'Orlando',
  lastName: 'Martínez',
  titleLabel: 'Tío Orlando y Familia.',
  guestLimit: 3,
  phone: '+50370000000',
};

const validToken = 'V1StGXR8_Z5jdHi6B-myT';

describe('createGuestSchema', () => {
  it('acceptsAGuestWithEveryFieldPresent', () => {
    expect(createGuestSchema.safeParse(validGuest).success).toBe(true);
  });

  it('acceptsAGuestWithoutLastNameOrTitleLabelBecauseBothAreOptional', () => {
    const result = createGuestSchema.safeParse({
      firstName: 'Orlando',
      guestLimit: 1,
      phone: '+50370000000',
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.lastName).toBeNull();
    expect(result.success && result.data.titleLabel).toBeNull();
  });

  it('rejectsGuestLimitBelowOneBecauseAnInvitationWithoutSeatsIsMeaningless', () => {
    expect(createGuestSchema.safeParse({ ...validGuest, guestLimit: 0 }).success).toBe(false);
  });

  it('rejectsGuestLimitAboveTheVenueCapPerInvitation', () => {
    expect(
      createGuestSchema.safeParse({ ...validGuest, guestLimit: MAX_GUEST_LIMIT + 1 }).success,
    ).toBe(false);
  });

  it('rejectsFractionalGuestLimit', () => {
    expect(createGuestSchema.safeParse({ ...validGuest, guestLimit: 2.5 }).success).toBe(false);
  });

  it('rejectsPhoneNumbersThatAreNotE164BecauseTheWaMeLinkWouldBreak', () => {
    const invalidPhones = ['70000000', '503 7000 0000', '+0123456789', 'not a phone'];

    for (const phone of invalidPhones) {
      expect(createGuestSchema.safeParse({ ...validGuest, phone }).success).toBe(false);
    }
  });

  it('rejectsAnEmptyFirstNameAfterTrimming', () => {
    expect(createGuestSchema.safeParse({ ...validGuest, firstName: '   ' }).success).toBe(false);
  });

  it('preservesAccentsAndTildesInNames', () => {
    const result = createGuestSchema.safeParse({
      ...validGuest,
      firstName: 'Íñigo',
      lastName: 'Peña',
    });

    expect(result.success && result.data.firstName).toBe('Íñigo');
    expect(result.success && result.data.lastName).toBe('Peña');
  });
});

describe('updateGuestSchema', () => {
  it('acceptsAPartialUpdateWithASingleField', () => {
    expect(updateGuestSchema.safeParse({ guestLimit: 4 }).success).toBe(true);
  });

  it('rejectsAnEmptyUpdateBecauseItWouldBeAPointlessWrite', () => {
    expect(updateGuestSchema.safeParse({}).success).toBe(false);
  });

  it('allowsReleasingAConfirmationSoTheGuestCanSubmitAgain', () => {
    expect(updateGuestSchema.safeParse({ confirmed: false, confirmedCount: 0 }).success).toBe(true);
  });
});

describe('rsvpRequestSchema', () => {
  it('acceptsACountOfOne', () => {
    expect(rsvpRequestSchema.safeParse({ token: validToken, count: 1 }).success).toBe(true);
  });

  it('rejectsACountOfZeroBecauseDecliningIsNotAnOption', () => {
    expect(rsvpRequestSchema.safeParse({ token: validToken, count: 0 }).success).toBe(false);
  });

  it('rejectsATokenOfTheWrongLength', () => {
    expect(rsvpRequestSchema.safeParse({ token: 'short', count: 1 }).success).toBe(false);
  });
});

describe('fitsWithinGuestLimit', () => {
  it('acceptsACountEqualToTheLimit', () => {
    expect(fitsWithinGuestLimit(3, 3)).toBe(true);
  });

  it('rejectsACountAboveTheLimitEvenWhenTheClientAllowedIt', () => {
    expect(fitsWithinGuestLimit(4, 3)).toBe(false);
  });

  it('rejectsZeroAndNegativeCounts', () => {
    expect(fitsWithinGuestLimit(0, 3)).toBe(false);
    expect(fitsWithinGuestLimit(-1, 3)).toBe(false);
  });

  it('rejectsFractionalCounts', () => {
    expect(fitsWithinGuestLimit(1.5, 3)).toBe(false);
  });
});

describe('resolveDisplayName', () => {
  it('prefersTitleLabelBecauseItIsWhatTheEnvelopeShows', () => {
    expect(
      resolveDisplayName({
        titleLabel: 'Tío Orlando y Familia.',
        firstName: 'Orlando',
        lastName: 'Martínez',
      }),
    ).toBe('Tío Orlando y Familia.');
  });

  it('fallsBackToFullNameWhenTitleLabelIsNull', () => {
    expect(
      resolveDisplayName({ titleLabel: null, firstName: 'Orlando', lastName: 'Martínez' }),
    ).toBe('Orlando Martínez');
  });

  it('fallsBackToFirstNameAloneWhenThereIsNoLastName', () => {
    expect(resolveDisplayName({ titleLabel: null, firstName: 'Orlando', lastName: null })).toBe(
      'Orlando',
    );
  });

  it('treatsAnEmptyTitleLabelAsAbsent', () => {
    expect(resolveDisplayName({ titleLabel: '', firstName: 'Orlando', lastName: null })).toBe(
      'Orlando',
    );
  });
});

describe('guestLimitCoversConfirmedCount', () => {
  it('acceptsALimitEqualToTheConfirmedCount', () => {
    expect(guestLimitCoversConfirmedCount(3, 3)).toBe(true);
  });

  it('rejectsALimitBelowTheConfirmedCount', () => {
    expect(guestLimitCoversConfirmedCount(2, 3)).toBe(false);
  });

  it('acceptsALimitAboveTheConfirmedCount', () => {
    expect(guestLimitCoversConfirmedCount(5, 3)).toBe(true);
  });
});

describe('computeGuestStats', () => {
  const confirmedGuest = { confirmed: true, confirmedCount: 3, firstOpenedAt: new Date() };
  const openedNotConfirmedGuest = {
    confirmed: false,
    confirmedCount: 0,
    firstOpenedAt: new Date(),
  };
  const neverOpenedGuest = { confirmed: false, confirmedCount: 0, firstOpenedAt: null };

  it('returnsAllZerosForAnEmptyList', () => {
    expect(computeGuestStats([])).toEqual({
      total: 0,
      confirmed: 0,
      pending: 0,
      openedNotConfirmed: 0,
      totalConfirmedPeople: 0,
    });
  });

  it('talliesEachCategorySeparately', () => {
    expect(computeGuestStats([confirmedGuest, openedNotConfirmedGuest, neverOpenedGuest])).toEqual({
      total: 3,
      confirmed: 1,
      pending: 2,
      openedNotConfirmed: 1,
      totalConfirmedPeople: 3,
    });
  });

  it('doesNotCountAConfirmedGuestAsOpenedNotConfirmed', () => {
    expect(computeGuestStats([confirmedGuest]).openedNotConfirmed).toBe(0);
  });

  it('onlySumsConfirmedCountForGuestsWhoActuallyConfirmed', () => {
    const pendingWithStaleCount = { confirmed: false, confirmedCount: 4, firstOpenedAt: null };

    expect(computeGuestStats([pendingWithStaleCount]).totalConfirmedPeople).toBe(0);
  });
});

describe('adminGuestSchema', () => {
  const wireGuest = {
    ...validGuest,
    id: 'doc-1',
    token: validToken,
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: '2026-08-30T12:00:00.000Z',
    invitedAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  };

  it('coercesIsoDateStringsFromJsonIntoRealDateInstances', () => {
    const parsed = adminGuestSchema.parse(wireGuest);

    expect(parsed.firstOpenedAt).toBeInstanceOf(Date);
    expect(parsed.createdAt).toBeInstanceOf(Date);
  });

  it('keepsNullDatesAsNullInsteadOfCoercingThem', () => {
    const parsed = adminGuestSchema.parse(wireGuest);

    expect(parsed.confirmedAt).toBeNull();
  });
});

describe('adminGuestListResponseSchema', () => {
  it('parsesAGuestsAndStatsEnvelopeTogether', () => {
    const parsed = adminGuestListResponseSchema.parse({
      guests: [],
      stats: { total: 0, confirmed: 0, pending: 0, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
    });

    expect(parsed.guests).toEqual([]);
    expect(parsed.stats.total).toBe(0);
  });
});
