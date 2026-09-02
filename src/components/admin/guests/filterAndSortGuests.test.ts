import { describe, expect, it } from 'vitest';
import { filterGuests, sortGuests } from '@/components/admin/guests/filterAndSortGuests';
import type { AdminGuest } from '@/schemas/guest';

function makeGuest(overrides: Partial<AdminGuest>): AdminGuest {
  return {
    id: 'id',
    token: 'V1StGXR8_Z5jdHi6B-myT',
    firstName: 'Orlando',
    lastName: 'Martínez',
    titleLabel: null,
    guestLimit: 3,
    phone: '+50370000000',
    confirmed: false,
    confirmedCount: 0,
    confirmedAt: null,
    firstOpenedAt: null,
    invitedAt: null,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    ...overrides,
  };
}

describe('filterGuests', () => {
  const orlando = makeGuest({ firstName: 'Orlando', lastName: 'Martínez', confirmed: false });
  const fatima = makeGuest({ firstName: 'Fátima', lastName: 'Pérez', confirmed: true });
  const all = [orlando, fatima];

  it('returnsEveryGuestWhenSearchIsEmptyAndStatusIsAll', () => {
    expect(filterGuests(all, '', 'all')).toEqual(all);
  });

  it('matchesRegardlessOfAccentsAndCase', () => {
    expect(filterGuests(all, 'fatima', 'all')).toEqual([fatima]);
    expect(filterGuests(all, 'PEREZ', 'all')).toEqual([fatima]);
  });

  it('matchesByPhoneToo', () => {
    expect(filterGuests(all, '70000000', 'all')).toEqual(all);
  });

  it('filtersToOnlyConfirmedGuests', () => {
    expect(filterGuests(all, '', 'confirmed')).toEqual([fatima]);
  });

  it('filtersToOnlyPendingGuests', () => {
    expect(filterGuests(all, '', 'pending')).toEqual([orlando]);
  });

  it('combinesTheSearchAndStatusFilters', () => {
    expect(filterGuests(all, 'martinez', 'confirmed')).toEqual([]);
  });
});

describe('sortGuests', () => {
  const orlando = makeGuest({ firstName: 'Orlando', confirmed: false });
  const ana = makeGuest({ firstName: 'Ana', confirmed: true });

  it('sortsByNameAscending', () => {
    expect(sortGuests([orlando, ana], { key: 'name', direction: 'asc' })).toEqual([ana, orlando]);
  });

  it('sortsByNameDescending', () => {
    expect(sortGuests([ana, orlando], { key: 'name', direction: 'desc' })).toEqual([orlando, ana]);
  });

  it('sortsPendingBeforeConfirmedWhenAscending', () => {
    expect(sortGuests([ana, orlando], { key: 'status', direction: 'asc' })).toEqual([orlando, ana]);
  });

  it('doesNotMutateTheOriginalArray', () => {
    const original = [orlando, ana];
    sortGuests(original, { key: 'name', direction: 'asc' });

    expect(original).toEqual([orlando, ana]);
  });
});
