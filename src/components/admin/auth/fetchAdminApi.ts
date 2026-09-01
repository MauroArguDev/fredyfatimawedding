import { signOut } from 'firebase/auth';
import { auth } from '@/components/admin/auth/firebaseClient';

const HTTP_UNAUTHORIZED = 401;

export async function fetchAdminApi(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);

  if (token !== undefined) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === HTTP_UNAUTHORIZED) {
    await signOut(auth);
  }

  return response;
}
