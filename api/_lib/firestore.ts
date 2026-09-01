import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readRequiredEnv } from './env';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

export const GUESTS_COLLECTION = 'guests';

function buildApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert({
      projectId: readRequiredEnv('FIREBASE_PROJECT_ID'),
      clientEmail: readRequiredEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: readRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Returns the shared Firestore instance for this serverless invocation.
 * Reuses the app across warm invocations so each request does not pay the
 * credential handshake again.
 */
export function firestore(): Firestore {
  return getFirestore(buildApp());
}

/**
 * Returns the shared Firebase Auth instance, used only to verify admin ID
 * tokens on the /api/admin routes.
 */
export function auth(): Auth {
  return getAuth(buildApp());
}
