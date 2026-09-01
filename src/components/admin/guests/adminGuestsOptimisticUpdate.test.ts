import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  applyOptimisticGuestsUpdate,
  restoreGuestsSnapshot,
  withAddedGuest,
  withPatchedGuest,
  withoutGuest,
} from '@/components/admin/guests/adminGuestsOptimisticUpdate';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';
import type { AdminGuest, AdminGuestListResponse } from '@/schemas/guest';

function makeGuest(overrides: Partial<AdminGuest>): AdminGuest {
  return {
    id: 'id-1',
    token: 'V1StGXR8_Z5jdHi6B-myT',
    firstName: 'Orlando',
    lastName: null,
    titleLabel: null,
    guestLimit: 3,
    phone: '+50370000000',
    notes: null,
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    ...overrides,
  };
}

const orlando = makeGuest({ id: 'id-1' });
const fatima = makeGuest({ id: 'id-2', firstName: 'Fátima', confirmed: true, confirmedCount: 2 });

describe('withAddedGuest', () => {
  it('appendsTheGuestAndRecomputesStats', () => {
    const previous: AdminGuestListResponse = {
      guests: [orlando],
      stats: { total: 1, confirmed: 0, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
    };

    const next = withAddedGuest(previous, fatima);

    expect(next.guests).toEqual([orlando, fatima]);
    expect(next.stats.total).toBe(2);
    expect(next.stats.confirmed).toBe(1);
  });
});

describe('withPatchedGuest', () => {
  it('mergesThePatchIntoTheMatchingGuestOnly', () => {
    const previous: AdminGuestListResponse = {
      guests: [orlando, fatima],
      stats: { total: 2, confirmed: 1, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 2 },
    };

    const next = withPatchedGuest(previous, 'id-1', { notes: 'called them' });

    expect(next.guests[0]?.notes).toBe('called them');
    expect(next.guests[1]).toEqual(fatima);
  });

  it('recomputesStatsFromThePatchedList', () => {
    const previous: AdminGuestListResponse = {
      guests: [orlando],
      stats: { total: 1, confirmed: 0, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
    };

    const next = withPatchedGuest(previous, 'id-1', { confirmed: false, confirmedCount: 0 });

    expect(next.stats.pending).toBe(1);
  });
});

describe('withoutGuest', () => {
  it('removesOnlyTheMatchingGuestAndRecomputesStats', () => {
    const previous: AdminGuestListResponse = {
      guests: [orlando, fatima],
      stats: { total: 2, confirmed: 1, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 2 },
    };

    const next = withoutGuest(previous, 'id-1');

    expect(next.guests).toEqual([fatima]);
    expect(next.stats.total).toBe(1);
  });
});

describe('applyOptimisticGuestsUpdate', () => {
  it('returnsUndefinedAndWritesNothingWhenThereIsNoCachedData', async () => {
    const queryClient = new QueryClient();

    const previous = await applyOptimisticGuestsUpdate(queryClient, (data) => data);

    expect(previous).toBeUndefined();
  });

  it('cancelsInFlightQueriesAndWritesTheUpdatedData', async () => {
    const queryClient = new QueryClient();
    const initial: AdminGuestListResponse = {
      guests: [orlando],
      stats: { total: 1, confirmed: 0, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
    };
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, initial);

    const previous = await applyOptimisticGuestsUpdate(queryClient, (data) =>
      withAddedGuest(data, fatima),
    );

    expect(previous).toEqual(initial);
    expect(queryClient.getQueryData(ADMIN_GUESTS_QUERY_KEY)).toEqual(
      withAddedGuest(initial, fatima),
    );
  });
});

describe('restoreGuestsSnapshot', () => {
  it('writesTheSnapshotBackWhenItIsDefined', () => {
    const queryClient = new QueryClient();
    const snapshot: AdminGuestListResponse = {
      guests: [orlando],
      stats: { total: 1, confirmed: 0, pending: 1, openedNotConfirmed: 0, totalConfirmedPeople: 0 },
    };

    restoreGuestsSnapshot(queryClient, snapshot);

    expect(queryClient.getQueryData(ADMIN_GUESTS_QUERY_KEY)).toEqual(snapshot);
  });

  it('doesNothingWhenTheSnapshotIsUndefined', () => {
    const queryClient = new QueryClient();

    restoreGuestsSnapshot(queryClient, undefined);

    expect(queryClient.getQueryData(ADMIN_GUESTS_QUERY_KEY)).toBeUndefined();
  });
});
