import type { VercelRequest, VercelResponse } from '@vercel/node';

const HTTP_OK = 200;

export default function handler(_request: VercelRequest, response: VercelResponse): void {
  response.status(HTTP_OK).json({ ok: true, service: 'fredyfatimawedding' });
}
