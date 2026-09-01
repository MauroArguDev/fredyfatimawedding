import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from '@/components/admin/auth/firebaseClient';
import { adminGuestToastCopy } from '@/content/adminGuestForm';

const HTTP_UNAUTHORIZED = 401;

export async function fetchAdminApi(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);

  if (token !== undefined) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers, cache: 'no-store' });

  if (response.status === HTTP_UNAUTHORIZED) {
    toast.error(adminGuestToastCopy.sessionExpired);
    await signOut(auth);
  }

  return response;
}
