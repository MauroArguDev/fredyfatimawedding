import type { QueryClient } from '@tanstack/react-query';
import { computeGuestStats, type AdminGuest, type AdminGuestListResponse } from '@/schemas/guest';
import { ADMIN_GUESTS_QUERY_KEY } from '@/components/admin/guests/adminGuestsQueryKey';

export async function applyOptimisticGuestsUpdate(
  queryClient: QueryClient,
  updater: (previous: AdminGuestListResponse) => AdminGuestListResponse,
): Promise<AdminGuestListResponse | undefined> {
  await queryClient.cancelQueries({ queryKey: ADMIN_GUESTS_QUERY_KEY });
  const previous = queryClient.getQueryData<AdminGuestListResponse>(ADMIN_GUESTS_QUERY_KEY);

  if (previous !== undefined) {
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, updater(previous));
  }

  return previous;
}

export function restoreGuestsSnapshot(
  queryClient: QueryClient,
  snapshot: AdminGuestListResponse | undefined,
): void {
  if (snapshot !== undefined) {
    queryClient.setQueryData(ADMIN_GUESTS_QUERY_KEY, snapshot);
  }
}

export function withAddedGuest(
  previous: AdminGuestListResponse,
  guest: AdminGuest,
): AdminGuestListResponse {
  const guests = [...previous.guests, guest];
  return { guests, stats: computeGuestStats(guests) };
}

export function withPatchedGuest(
  previous: AdminGuestListResponse,
  id: string,
  patch: Partial<AdminGuest>,
): AdminGuestListResponse {
  const guests = previous.guests.map((guest) => (guest.id === id ? { ...guest, ...patch } : guest));
  return { guests, stats: computeGuestStats(guests) };
}

export function withoutGuest(previous: AdminGuestListResponse, id: string): AdminGuestListResponse {
  const guests = previous.guests.filter((guest) => guest.id !== id);
  return { guests, stats: computeGuestStats(guests) };
}
