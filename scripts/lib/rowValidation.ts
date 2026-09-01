export interface RowError {
  row: number;
  message: string;
}

export function validateExactHeader(
  header: string[] | undefined,
  expectedHeader: readonly string[],
): string | null {
  const expected = expectedHeader.join(',');
  const actual = (header ?? []).join(',');

  return actual === expected ? null : `Expected header "${expected}", got "${actual}"`;
}
