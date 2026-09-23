import { describe, expect, it } from 'vitest';
import {
  AdminGuestsApiError,
  GuestImportValidationError,
  readAdminGuestsApiError,
  readGuestImportError,
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

describe('readGuestImportError', () => {
  it('returnsAGuestImportValidationErrorWithTheRowErrorsForInvalidCsv', async () => {
    const response = new Response(
      JSON.stringify({ code: 'INVALID_CSV', errors: [{ row: 2, message: 'boom' }] }),
      { status: 400 },
    );

    const error = await readGuestImportError(response);

    expect(error).toBeInstanceOf(GuestImportValidationError);
    expect((error as GuestImportValidationError).errors).toEqual([{ row: 2, message: 'boom' }]);
  });

  it('fallsBackToAdminGuestsApiErrorWhenTheCodeIsNotInvalidCsv', async () => {
    const response = new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401 });

    const error = await readGuestImportError(response);

    expect(error).toBeInstanceOf(AdminGuestsApiError);
    expect((error as AdminGuestsApiError).code).toBe('UNAUTHORIZED');
  });

  it('fallsBackToAdminGuestsApiErrorWhenInvalidCsvHasNoUsableErrorsArray', async () => {
    const response = new Response(JSON.stringify({ code: 'INVALID_CSV' }), { status: 400 });

    const error = await readGuestImportError(response);

    expect(error).toBeInstanceOf(AdminGuestsApiError);
  });
});
