import { normalizeForSearch } from '@/lib/normalizeForSearch';
import { resolveDisplayName, type AdminGuest } from '@/schemas/guest';

export type GuestStatusFilter = 'all' | 'confirmed' | 'pending';
export type GuestSortKey = 'name' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface GuestSortState {
  key: GuestSortKey;
  direction: SortDirection;
}

export function filterGuests(
  guests: readonly AdminGuest[],
  search: string,
  status: GuestStatusFilter,
): AdminGuest[] {
  const normalizedSearch = normalizeForSearch(search.trim());

  return guests.filter((guest) => {
    if (status === 'confirmed' && !guest.confirmed) {
      return false;
    }
    if (status === 'pending' && guest.confirmed) {
      return false;
    }

    return matchesSearch(guest, normalizedSearch);
  });
}

function matchesSearch(guest: AdminGuest, normalizedSearch: string): boolean {
  if (normalizedSearch.length === 0) {
    return true;
  }

  const haystack = [guest.firstName, guest.lastName, guest.titleLabel, guest.phone]
    .filter((part): part is string => part !== null)
    .map(normalizeForSearch)
    .join(' ');

  return haystack.includes(normalizedSearch);
}

export function sortGuests(guests: readonly AdminGuest[], sort: GuestSortState): AdminGuest[] {
  const factor = sort.direction === 'asc' ? 1 : -1;
  const compare = sort.key === 'name' ? compareByName : compareByStatus;

  return [...guests].sort((a, b) => factor * compare(a, b));
}

function compareByName(a: AdminGuest, b: AdminGuest): number {
  return resolveDisplayName(a).localeCompare(resolveDisplayName(b), 'es');
}

function compareByStatus(a: AdminGuest, b: AdminGuest): number {
  return Number(a.confirmed) - Number(b.confirmed);
}
