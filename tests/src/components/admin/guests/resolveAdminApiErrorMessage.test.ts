import { describe, expect, it } from 'vitest';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { AdminGuestsApiError } from '@/components/admin/guests/adminGuestsApiError';
import { adminGuestFormErrorCopy } from '@/content/adminGuestForm';

describe('resolveAdminApiErrorMessage', () => {
  it('returnsNullWhenThereIsNoError', () => {
    expect(resolveAdminApiErrorMessage(null)).toBeNull();
  });

  it('mapsAnAdminGuestsApiErrorToItsCodeSpecificMessage', () => {
    expect(resolveAdminApiErrorMessage(new AdminGuestsApiError('NOT_FOUND'))).toBe(
      adminGuestFormErrorCopy.NOT_FOUND,
    );
  });

  it('mapsATypeErrorToTheNetworkMessageBecauseFetchThrowsThatOnConnectionFailures', () => {
    expect(resolveAdminApiErrorMessage(new TypeError('Failed to fetch'))).toBe(
      adminGuestFormErrorCopy.NETWORK,
    );
  });

  it('fallsBackToTheUnknownMessageForAnythingElse', () => {
    expect(resolveAdminApiErrorMessage(new Error('boom'))).toBe(adminGuestFormErrorCopy.UNKNOWN);
  });
});
