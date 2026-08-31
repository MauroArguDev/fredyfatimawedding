import type { RowError } from './rowValidation';

export function requireArg(index: number, usage: string): string {
  const value = process.argv[index];

  if (value === undefined) {
    console.error(usage);
    process.exit(1);
  }

  return value;
}

export function reportRowErrorsAndExit(title: string, errors: RowError[]): never {
  console.error(title);

  for (const error of errors) {
    console.error(`  Row ${String(error.row)}: ${error.message}`);
  }

  process.exit(1);
}
