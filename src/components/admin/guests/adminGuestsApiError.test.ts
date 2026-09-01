import { describe, expect, it } from 'vitest';
import {
  AdminGuestsApiError,
  readAdminGuestsApiError,
} from '@/components/admin/guests/adminGuestsApiError';

describe('readAdminGuestsApiError', () => {
  it('readsTheCodeFromAJsonErrorBody', async () => {
    const response = new Response(JSON.stringify({ code: 'INVALID_PAYLOAD' }), { status: 400 });

    const error = await readAdminGuestsApiError(response);

    expect(error).toBeInstanceOf(AdminGuestsApiError);
    expect(error.code).toBe('INVALID_PAYLOAD');
  });

  it('fallsBackToUnknownWhenTheBodyIsNotJson', async () => {
    const response = new Response('not json', { status: 500 });

    const error = await readAdminGuestsApiError(response);

    expect(error.code).toBe('UNKNOWN');
  });

  it('fallsBackToUnknownWhenTheBodyHasNoCodeField', async () => {
    const response = new Response(JSON.stringify({ message: 'oops' }), { status: 500 });

    const error = await readAdminGuestsApiError(response);

    expect(error.code).toBe('UNKNOWN');
  });
});
