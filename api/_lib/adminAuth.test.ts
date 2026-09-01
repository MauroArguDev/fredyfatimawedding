import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { auth } from './firestore';
import { UnauthorizedError, requireAuth, withAdminAuth } from './adminAuth';
import type { AdminHandler } from './adminAuth';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DecodedIdToken } from 'firebase-admin/auth';

vi.mock('./firestore', () => ({ auth: vi.fn() }));

function buildRequest(authorization?: string): VercelRequest {
  return { headers: authorization === undefined ? {} : { authorization } } as unknown as VercelRequest;
}

function buildResponse(): VercelResponse & { json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { status, json } as unknown as VercelResponse & { json: ReturnType<typeof vi.fn> };
}

function mockVerifyIdToken(implementation: (token: string) => Promise<DecodedIdToken>): void {
  vi.mocked(auth).mockReturnValue({ verifyIdToken: implementation } as unknown as ReturnType<typeof auth>);
}

const DECODED_TOKEN = { uid: 'the-bride' } as unknown as DecodedIdToken;

describe('requireAuth', () => {
  it('rejectsARequestWithNoAuthorizationHeader', async () => {
    await expect(requireAuth(buildRequest())).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejectsAnAuthorizationHeaderWithoutTheBearerPrefix', async () => {
    await expect(requireAuth(buildRequest(DECODED_TOKEN.uid))).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejectsABearerHeaderWithAnEmptyToken', async () => {
    await expect(requireAuth(buildRequest('Bearer '))).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('resolvesTheDecodedTokenForAValidBearerToken', async () => {
    mockVerifyIdToken(() => Promise.resolve(DECODED_TOKEN));

    await expect(requireAuth(buildRequest('Bearer a-valid-token'))).resolves.toBe(DECODED_TOKEN);
  });

  it('rejectsWhenFirebaseAdminRejectsTheTokenForAnyReasonIncludingAWrongProjectAudience', async () => {
    mockVerifyIdToken(() => Promise.reject(new Error('Firebase ID token has expired')));

    await expect(requireAuth(buildRequest('Bearer an-expired-or-foreign-token'))).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});

describe('withAdminAuth', () => {
  it('respondsWithUnauthorizedAndNeverCallsTheHandlerWhenAuthFails', async () => {
    const innerHandler: AdminHandler = vi.fn();
    const response = buildResponse();

    await withAdminAuth(innerHandler)(buildRequest(), response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ code: 'UNAUTHORIZED' });
    expect(innerHandler).not.toHaveBeenCalled();
  });

  it('callsTheHandlerWithTheDecodedTokenWhenAuthSucceeds', async () => {
    mockVerifyIdToken(() => Promise.resolve(DECODED_TOKEN));
    const innerHandler: AdminHandler = vi.fn().mockResolvedValue(undefined);
    const response = buildResponse();
    const request = buildRequest('Bearer a-valid-token');

    await withAdminAuth(innerHandler)(request, response);

    expect(innerHandler).toHaveBeenCalledWith(request, response, DECODED_TOKEN);
  });

  it('letsAnUnrelatedErrorFromTheHandlerPropagateInsteadOfSwallowingIt', async () => {
    mockVerifyIdToken(() => Promise.resolve(DECODED_TOKEN));
    const failure = new Error('Firestore is unreachable');
    const innerHandler: AdminHandler = vi.fn().mockRejectedValue(failure);
    const response = buildResponse();

    await expect(withAdminAuth(innerHandler)(buildRequest('Bearer a-valid-token'), response)).rejects.toThrow(
      failure,
    );
  });
});

describe('admin route protection', () => {
  it('everyHandlerUnderApiAdminIsWrappedInWithAdminAuth', () => {
    const routeFiles = globSync('api/admin/**/*.ts').filter((file) => !file.endsWith('.test.ts'));

    for (const file of routeFiles) {
      expect(readFileSync(file, 'utf8')).toContain('withAdminAuth');
    }
  });
});
