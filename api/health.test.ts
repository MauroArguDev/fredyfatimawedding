import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from './health';

function buildResponse(): VercelResponse {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse;
}

describe('health endpoint', () => {
  it('respondsWithTwoHundredSoTheDeployCanBeVerified', () => {
    const response = buildResponse();

    handler({} as VercelRequest, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });
});
