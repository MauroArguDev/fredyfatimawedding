import { auth } from './firestore.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DecodedIdToken } from 'firebase-admin/auth';

const BEARER_PREFIX = 'Bearer ';
const HTTP_UNAUTHORIZED = 401;

export class UnauthorizedError extends Error {}

function extractBearerToken(request: VercelRequest): string | null {
  const header = request.headers.authorization;

  if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }

  const token = header.slice(BEARER_PREFIX.length);

  return token.length > 0 ? token : null;
}

/**
 * Verifies the Firebase ID token on an /api/admin/* request, throwing
 * UnauthorizedError when the header is missing or firebase-admin rejects the
 * token for any reason. verifyIdToken already checks the token's audience
 * against this project, so a rejection here also covers a token issued by a
 * different Firebase project — there is no second project to test against
 * under ADR-011, so that guarantee is Firebase's own, not reimplemented here.
 */
export async function requireAuth(request: VercelRequest): Promise<DecodedIdToken> {
  const token = extractBearerToken(request);

  if (token === null) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  try {
    return await auth().verifyIdToken(token);
  } catch {
    throw new UnauthorizedError('Invalid ID token');
  }
}

export type AdminHandler = (
  request: VercelRequest,
  response: VercelResponse,
  admin: DecodedIdToken,
) => Promise<void>;

/**
 * Wraps an /api/admin/* handler so it is protected by construction: a
 * handler can only be exported through this function, so there is no route
 * left for someone to forget to guard individually.
 */
export function withAdminAuth(
  handler: AdminHandler,
): (request: VercelRequest, response: VercelResponse) => Promise<void> {
  return async (request, response) => {
    let admin: DecodedIdToken;

    try {
      admin = await requireAuth(request);
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }

      response.status(HTTP_UNAUTHORIZED).json({ code: 'UNAUTHORIZED' });
      return;
    }

    await handler(request, response, admin);
  };
}
