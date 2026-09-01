export function readRequiredEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name] as string | undefined;

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${String(name)}`);
  }

  return value;
}
