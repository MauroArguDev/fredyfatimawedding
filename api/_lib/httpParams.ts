import type { VercelRequest } from '@vercel/node';

export function extractRouteParam(query: VercelRequest['query'], key: string): string | null {
  const value = query[key];

  return typeof value === 'string' && value.length > 0 ? value : null;
}
