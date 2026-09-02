export class AdminGuestsApiError extends Error {
  code: string;

  constructor(code: string) {
    super(`Admin guests API error: ${code}`);
    this.name = 'AdminGuestsApiError';
    this.code = code;
  }
}

function readErrorCode(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof body.code === 'string'
  ) {
    return body.code;
  }

  return 'UNKNOWN';
}

export async function readAdminGuestsApiError(response: Response): Promise<AdminGuestsApiError> {
  const body: unknown = await response.json().catch(() => null);

  return new AdminGuestsApiError(readErrorCode(body));
}

export interface GuestImportRowError {
  row: number;
  message: string;
}

export class GuestImportValidationError extends Error {
  errors: GuestImportRowError[];

  constructor(errors: GuestImportRowError[]) {
    super('Guest import validation failed');
    this.name = 'GuestImportValidationError';
    this.errors = errors;
  }
}

function readImportRowErrors(body: unknown): GuestImportRowError[] | null {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('errors' in body) ||
    !Array.isArray(body.errors)
  ) {
    return null;
  }

  return body.errors.filter(
    (item: unknown): item is GuestImportRowError =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { row: unknown }).row === 'number' &&
      typeof (item as { message: unknown }).message === 'string',
  );
}

export async function readGuestImportError(
  response: Response,
): Promise<GuestImportValidationError | AdminGuestsApiError> {
  const body: unknown = await response.json().catch(() => null);
  const code = readErrorCode(body);

  if (code === 'INVALID_CSV') {
    const rowErrors = readImportRowErrors(body);

    if (rowErrors !== null) {
      return new GuestImportValidationError(rowErrors);
    }
  }

  return new AdminGuestsApiError(code);
}
