/**
 * Reads a required environment variable, throwing early and loudly instead
 * of letting a missing credential surface as a confusing downstream error.
 */
export function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
