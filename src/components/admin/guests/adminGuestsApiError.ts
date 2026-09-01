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
